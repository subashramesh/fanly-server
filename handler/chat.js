const db = require('../service/chat/postgres')
const token = require('../middleware/auth')
const socket = require('./chat_socket.js')
const messaging = require('../service/firebase/messaging.js')
const { getConversationId } = require('./manager')
const { ThreadType, ThreadEventType} = require('../consts/enums.js')
const manager = require('./manager.js')

exports.enter = async (req, res) => {
    let user = req.body.user || req.query.user || req.body.id || req.query.id;

    if(!user){
        return res.status(400).send({
            status: '400',
            message: 'Bad Request'
        })
    }

    

    try {
        let box = getConversationId(req.user.id, user);
        let payload = {
            owner: req.user.id,
            box: box,
            updated_at: now()
        }
        let result = await db.knex('account_route').insert(payload, 'id').onConflict(['owner']).merge();
        payload.id = result[0].id;
    
        socket.send(user, 'chat_enter', payload);
        
        let op = await db.select('account_route', {
            fields: ['*'],
            conditions: [
                ['owner', '=', user],
                ['box', '=', box]
            ]
        })
    
        if(op.length > 0){
            return res.status(200).send({
                status: '200',
                message: 'User in current conversation',
                data: op[0]
            })
        } else {
            return res.status(201).send({
                status: '201',
                message: 'User not in current conversation',
                data: payload
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}
exports.exit = async (req, res) => {
    let user = req.body.user || req.query.user || req.body.id || req.query.id;
    if(!user){
        return res.status(400).send({
            status: '400',
            message: 'Bad Request'
        })
    }
    
    try {
        let box = getConversationId(req.user.id, user);
        let payload = {
            owner: req.user.id,
            updated_at: now(),
            box: null
        }
        let result = await db.knex('account_route').insert(payload, 'id').onConflict(['owner']).merge();
        payload.id = result[0].id;
        payload.box = box;
        socket.send(user, 'chat_exit', payload);
        return res.status(200).send({
            status: '200',
            message: 'Chat exit success',
            data: payload
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.generateToken = async (req, res) => {
    let payload = req.body;
    let result = token.generateToken(payload);
    return res.status(200).json({
        status: '200',
        message: 'Success',
        data: {
            token: result
        }
    })
}

exports.sendMessage = async (req, res) => {
    let body = req.body;
    let payload = {
        sender: req.user.id,
        receiver: body.receiver,
        text: body.text,
        type: body.type,
        data: body.data,
        group: body.group,
        channel: body.channel,
        broadcast: body.broadcast,
        parent: body.parent,
        updated_at: now(),
        created_at: now(),
        box: body.box,
        forwarded: body.forwarded || false,
        thread_group: body.thread_group
    }

    if(payload.box == null || payload.box == undefined){
        if(payload.group){
            payload.box = `g-${payload.group}`;
        } else if(payload.channel){
            payload.box = `c-${payload.channel}`;
        } else {
            payload.box = getConversationId(payload.sender, payload.receiver);
        }
    }

    console.log('sendMessag:', payload)

    try {
        let result = await db.insert('thread', payload, 'id');
        if(result.length > 0){
            payload.id = result[0].id;
            payload.created_at = now();

            var gg;

            if(payload.group){
                let ff = await db.select('group', {
                    fields: ['*'],
                    conditions: [
                        ['id', '=', payload.group]
                    ]
                })
                if(ff.length > 0){
                    gg = ff[0];
                }
            }
            

            if(payload.broadcast){
                let b = await db.select('broadcast', {
                    fields: ['*'],
                    conditions: [
                        ['id', '=', payload.broadcast]
                    ]
                })
                if(b.length > 0){
                    let br = b[0];
                    let members = br.members;
                    for(let e of members){
                        console.log('sending broadcast to', e);
                        let payload2 = {
                            ...payload
                        }
                        payload2.box = getConversationId(payload.sender, e);
                        payload2.receiver = e;
                        payload2.parent = payload.id;
                        delete payload2.id;
                        let result2 = await db.insert('thread', payload2, 'id');
                        if(result2.length > 0){
                            payload2.id = result2[0].id;
                            payload2.created_at = now();
                            sendMessage(payload2, req, gg);
                        }
                    }
                    let groups = br.groups;
                    for(let e of groups){
                        let ggg = await db.select('group', {
                            fields: ['*'],
                            conditions: [
                                ['id', '=', e]
                            ]
                        })
                        if(ggg.length > 0){
                        var payload2 = {
                            ...payload
                        }
                        payload2.group = e;
                        payload2.box = `g-${e}`;
                        delete payload2.id;
                        let result2 = await db.insert('thread', payload2, 'id');
                        if(result2.length > 0){
                            payload2.id = result2[0].id;
                            payload2.created_at = now();
                            sendMessage(payload2, req, ggg[0]);
                        }
                    }
                    }
                }
            }
            payload.local = body.local;
            sendMessage(payload, req, gg);
            
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: payload
            })
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            })
        }
    } catch (e) {
        console.log('sendMessage Error')
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

async function sendMessage(payload, req, group) {
    let receiver = await getReceivers(payload);
    socket.send(receiver, 'message', payload);
    db.update('thread', {
        fields: {
            receivers: receiver
        },
        conditions: [
            ['id', '=', payload.id]
        ]
    })
    let filtered = await filterReceivers(receiver, payload.box);
    // remove req.user.id from filtered
    let index = filtered.indexOf(req.user.id);
    if (index > -1) {
        filtered.splice(index, 1);
    }
    let tokens = await getTokens(filtered);
    if(tokens.length > 0){
        let data = {
            type: 'message',
            payload: JSON.stringify(payload)
        }

        var body = payload.text;
        
        switch(payload.type){
            case ThreadType.text:
                body = payload.text;
                break;
            case ThreadType.image:
                body = '📷 Image';
                break;
            case ThreadType.video:
                body = '📹 Video';
                break;
            case ThreadType.audio:
                body = '🎵 Audio';
                break;
            case ThreadType.document:
                body = '📄 Document';
                break;
            case ThreadType.location:
                body = '📍 Location';
                break;
            case ThreadType.contact:
                body = '👤 Contact';
                break;
            case ThreadType.link:
                body = '🔗 Link';
                break;
            case ThreadType.poll:
                body = '📊 Poll';
                break;
            case ThreadType.voice:
                body = '🎤 Voice';
                break;
            case ThreadType.sticker:
                body = 'Sticker';
                break;
            case ThreadType.gif:
                body = 'GIF';
                break;
            case ThreadType.post:
                body = 'Post';
                break;
            case ThreadType.status:
                body = 'Status';
                break;
            case ThreadType.mention:
                body = 'Mentioned you';
                break;
        }

        data.collapseKey = `${payload.box}-${payload.id}`;

        //

        if(payload.group){
            // iterate filtered array in for in loop
            for (let i = 0; i < filtered.length; i++) {
                let name = await getName(payload.sender, filtered[i]);
                let tokens = await getTokens(filtered[i]);
                await messaging.message(tokens, data, {
                    title: group.name,
                    body: `${name}: ${body}`
                });
            }
        } else {
            let name = await getOnlyName(payload.sender, payload.receiver);
            await messaging.message(tokens, data, {
                title: name,
                body: body
            });
        }
    }
}

async function getName(sender, receiver){
    let result = await db.select('account', {
        fields: ['*'],
        conditions: [
            ['id', '=', sender]
        ]
    })
    if(result.length == 0){
        return `User::${sender}`
    }
    let result2 = await db.select('contact', {
        fields: ['*'],
        conditions: [
            ['phone', '=', result[0].normalized],
            ['user', '=', receiver]
        ]
    })
    if(result2.length == 0 ){
        return `${result[0].normalized}`
    }
    return `${result2[0].name}`
}

async function getOnlyName(sender, receiver){
    let result = await db.select('account', {
        fields: ['*'],
        conditions: [
            ['id', '=', sender]
        ]
    })
    if(result.length == 0){
        return `User::${sender}`
    }
    let result2 = await db.select('contact', {
        fields: ['*'],
        conditions: [
            ['phone', '=', result[0].normalized],
            ['user', '=', receiver]
        ]
    })
    if(result2.length == 0 ){
        return result[0].dname
    }
    return result2[0].name
}

exports.getName = getName;
exports.getOnlyName = getOnlyName;


exports.receive = async (req, res) => {
    let body = req.body || req.query;
    var threads = [];
    //check if body is array
    if(Array.isArray(body)){
        threads = body;
    } else {
        threads.push(body);
    }
    let ids = [];

    try {
        let payload = [];
        for (let i = 0; i < threads.length; i++) {
            let thread = threads[i];
            if(ids.includes(thread.id)){
                continue;
            }
            ids.push(thread.id);
            
            payload.push({
                thread: thread.id,
                user: req.user.id,
                created_at: now()
            });
        }
        await db.knex.table('thread_deliver').insert(payload).onConflict(['thread', 'user']).merge();
        await db.update('thread', {
            fields: {
                updated_at: now(),
            },
            conditions: [
                ['id', 'in', ids]
            ]
        })
        let updated = await db.select('thread', {
            fields: ['*'],
            conditions: [
                ['id', 'in', ids]
            ]
        });
        let updatedMap = {};
        updated.forEach(e => {
            updatedMap[`${e.id}`] = e;
        })
        for(let i = 0; i < threads.length; i++){
            let thread = updatedMap[`${threads[i].id}`] || threads[i];
            socket.send(thread.sender, 'delivered', {
                thread: thread,
                receipt: payload[i]
            });
        }

        return res.status(200).json({
            status: '200',
            message: 'Success'
        })

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.seen = async (req, res) => {
    let body = req.body;
    var threads = [];
    //check if body is array
    if(Array.isArray(body)){
        threads = body;
    } else {
        threads.push(body);
    }
    let ids = [];
    try {
        let payload = [];
        for (let i = 0; i < threads.length; i++) {
            let thread = threads[i];
            if(ids.includes(thread.id)){
                continue;
            }
            ids.push(thread.id);
            payload.push({
                thread: thread.id,
                user: req.user.id,
                created_at: now()
            });
        }
        // check payload is empty
        if(payload.length == 0){
            return res.status(200).json({
                status: '200',
                message: 'Success'
            })
        }

        await db.knex.table('thread_read').insert(payload).onConflict(['thread', 'user']).merge();
        await db.update('thread', {
            fields: {
                updated_at: now(),
            },
            conditions: [
                ['id', 'in', ids]
            ]
        })
        let updated = await db.select('thread', {
            fields: ['*'],
            conditions: [
                ['id', 'in', ids]
            ]
        });
        let updatedMap = {};
        updated.forEach(e => {
            updatedMap[`${e.id}`] = e;
        })
        for(let i = 0; i < threads.length; i++){
            let thread = updatedMap[`${threads[i].id}`] || threads[i];
            socket.send([thread.sender, thread.receiver], 'seen', {
                thread: thread,
                receipt: payload[i]
            });
        }

        return res.status(200).json({
            status: '200',
            message: 'Success',
        })

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.vote = async (req, res) => {
    let thread = req.params.id;
    let vote = req.body.vote;
    let entry = req.body.entry;
    let revoke = req.body.revoke;
    vote.user = req.user.id;

    console.log(req.body)
    

    try {
        let result = await db.select('thread', {
            fields: ['*'],
            conditions: [
                ['id', '=', thread]
            ]
        })
        if(result.length > 0){
            let data = result[0].data;
            let poll = data.poll;
            let votes = [];
            if(poll.votes){
                poll.votes.forEach(e => {
                    votes.push(e);
                });
            }
            if(revoke){
                let index = votes.findIndex((v) => {
                    return v.user == req.user.id && v.entry == entry.id
                })
                if(index > -1){
                    votes.splice(index, 1);
                }
            } else {
                votes.push(vote);
            }

            console.log(votes)
            poll.votes = votes;
            data.poll = poll;
            var payload = {
                data: JSON.stringify(data),
                updated_at: now()
            }
            var obj = result[0];
            let re = await db.select('reaction', {
                fields: ['*'],
                conditions: [
                    ['thread', '=', obj.id]
                ]
            })
            obj.reactions = re;
            obj.data = data;
            obj.updated_at = now();
            console.log(obj)
            let d = await db.update('thread', {
                fields: payload,
                conditions: [
                    ['id', '=', thread]
                ]
            })
            let receivers = await getReceivers(obj);
            receivers.push(obj.sender);
            socket.send(receivers, 'update', obj);
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: obj
                })
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.react = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let payload = {
        thread: id,
        sender: req.user.id,
        text: body.text,
    }

    try {
        var thread;

        let d = await db.select('thread', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if(d.length > 0){
            thread = d[0];
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            })
        }

        var result;
        
        if(body.id){
            result = await db.delete2('reaction', {
                conditions: [
                    ['id', '=', body.id]
                ]
            })
        } else {
            try{
                result = await db.insert('reaction', payload, 'id');
                payload.id = result[0].id;
            } catch(e){
                console.log(e)
                result = await db.update('reaction', {
                    fields: {
                        text: body.text,
                        created_at: now()
                    },
                    conditions: [
                        ['sender', '=', payload.sender],
                        ['thread', '=', payload.thread]
                    ]
                })
                payload.id = body.id;
            }
        }

        let re = await db.select('reaction', {
            fields: ['*'],
            conditions: [
                ['thread', '=', id]
            ]
        })
        await db.update('thread', {
            fields: {
                updated_at: now(),
            },
            conditions: [
                ['id', '=', id]
            ]
        })
        thread.reactions = re;
        let receivers = await getReceivers(thread);
        receivers.push(thread.sender);
        socket.send(receivers, 'update', thread);
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.star = async (req, res) => {
    let id = req.params.id

    try {
        let payload = {
            thread: id,
            owner: req.user.id,
        }
        let result = await db.knex('thread_star').insert(payload, 'id').onConflict(['thread', 'owner']).merge();
        payload.id = result[0].id;
        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.unstar = async (req, res) => {
    let id = req.params.id

    try {
        let result = await db.delete2('thread_star', {
            conditions: [
                ['thread', '=', id],
                ['owner', '=', req.user.id]
            ]
        })
        res.send({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.editThread = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let payload = {
        updated_at: now(),
        text: body.text,
        edited: true,
        data: body.data
    }

    try {
        var thread;

        let d = await db.select('thread', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if(d.length > 0){
            thread = d[0];
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            })
        }
        if(thread.sender != req.user.id){
            return res.status(403).json({
                status: '403',
                message: 'Forbidden'
            })
        }
        
        await db.update('thread', {
            fields: payload,
            conditions: [
                ['id', '=', id]
            ]
        });

        thread.text = body.text;
        thread.data = body.data;
        thread.edited = true;
        thread.reactions = body.reactions;
        thread.updated_at = now();
        let receivers = await getReceivers(thread);
        receivers.push(thread.sender);
        socket.send(receivers, 'update', thread);

        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: thread
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.deleteThread = async (req, res) => {
    let everyone = req.query.everyone;
    let id = req.params.id;
    try {
        
        payload = {
            updated_at: now(),
            deleted: true
        };

        var thread;

        let d = await db.select('thread', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if(d.length > 0){
            thread = d[0];
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            })
        }
        if(thread.sender != req.user.id){
            return res.status(403).json({
                status: '403',
                message: 'Forbidden'
            })
        }
        
        

        if(everyone == 'true'){
            await db.update('thread', {
                fields: payload,
                conditions: [
                    ['id', '=', id]
                ]
            });
    
            thread.deleted = true;
            let receivers = await getReceivers(thread);
            receivers.push(thread.sender);
            socket.send(receivers, 'update', thread);
            let result = await db.delete2('thread', {
                conditions: [
                    ['id', '=', id]
                ]
            })
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: result
            })
        } else {
            let result = await db.delete2('thread', {
                conditions: [
                    ['id', '=', id]
                ]
            })
        }

        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: thread
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.updatePref = async (req, res) => {
    let body = req.body;
    let background = body.background;
    let notification_sound = body.notification_sound;
    let wallpaper = req.query.wallpaper;
    let music = body.music;
    let payload = {
        updated_at: now(),
        box: body.box,
    }
    if(background && wallpaper){
        background.updated_at = now();
        background.updated_by = req.user.id;
        payload.background = background;
    }
    if(music){
        music.updated_at = now();
        music.updated_by = req.user.id;
        payload.music = music;
    }
    if(notification_sound){
        notification_sound.updated_at = now();
        notification_sound.updated_by = req.user.id;
        payload.notification_sound = notification_sound;
    }
    try {
        try{
            if(body.id){
                await db.update('chat_pref', {
                    fields: payload,
                    conditions: [
                        ['id', '=', body.id]
                    ]
                })
                payload.id = body.id;
            } else {
                let result = await db.insert('chat_pref', payload, 'id');
                payload.created_at = now();
                payload.id = result[0].id;
            }
        } catch(e){
            await db.update('chat_pref', {
                fields: payload,
                conditions: [
                    ['id', '=', body.id]
                ]
            })
            payload.id = body.id;
        }

        let rr = await db.select('chat_pref', {
            fields: ['*'],
            conditions: [
                ['id', '=', payload.id]
            ]
        });

        let receivers = body.box.split('-');


        if(receivers.includes('g')){
            let g = receivers[1];
            let members = await db.select('group_member', {
                fields: ['user'],
                conditions: [
                    ['group', '=', g]
                ]
            })
            let ids = members.map(e => e.user);
            socket.send(ids, 'update_pref', rr[0]);
        } else {
            socket.send(receivers, 'update_pref', rr[0]);
        }

        if(wallpaper){
            if(receivers.includes('g')){
                await manager.send(req, ThreadEventType.changeWallpaper, req.user.id, receivers[1] )
            }
        }
        

        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: rr[0]
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.syncBox = async (req, res) => {
    try{
        let params = `'${req.user.id}', '${req.query.last_updated}', '${req.query.box}'`;
        let threads = await db.fun('get_threads_box', {
            params
        })
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: threads
        });
    } catch (e){
        console.log(e)
        res.status(500).json({
            status: '500',
            message: `Internal Server Error ${e}`
        })  
    }
}

exports.sync = async (req, res) => {
    try {
        let result = await db.fun('get_convo_list', {
            params: `'${req.user.id}'`
        });
        let groups = await db.fun('get_groups', {
            params: `'${req.user.id}'`
        })
        let carbons = await db.fun('get_carbons', {
            params: `${req.user.id}`
        })
        var ids = '';
        groups.forEach(e => {
            ids += `${e.id},`
        })
        ids = ids.substring(0, ids.length - 1);
        let channels = await db.select('channel_member', {
            fields: ['channel'],
            conditions: [
                ['user', '=', req.user.id]
            ]
        })
        var channelIds = '';
        channels.forEach(e => {
            channelIds += `${e.channel},`
        });
        channelIds = channelIds.substring(0, channelIds.length - 1);
        let params = `'${req.user.id}', '${req.query.last_updated}', '{${ids}}'::bigint[], '{${channelIds}}'::bigint[]`;
        console.log(params)
        let threads = await db.fun('get_threads', {
           params
        })

        

        let updated_at = now();

        // console.log('sync threads:', threads)

        let boxes = []
        for(let i = 0; i < threads.length; i++){
            let thread = threads[i];
            if(thread.box){
                if(!boxes.includes(thread.box)){
                    boxes.push(thread.box)
                }
            }
        }
        for(let i = 0; i < result.length; i++){
            let thread = result[i];
            if(thread.box){
                if(!boxes.includes(thread.box)){
                    boxes.push(thread.box)
                }
            }
        }
        let chat_pref = await db.select('chat_pref', {
            fields: ['*'],
            conditions: [
                ['box', 'in', boxes]
            ]
        });
        for(let e of carbons){
            groups.push(e);
        }

        
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: {
                chats: result,
                threads: threads,
                groups: groups,
                chat_pref: chat_pref,
                updated_at
            }
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.updateFCM = async (req, res) => {
    try {
        let result = await db.insert('fcm', {
            'user': req.user.id,
            'token': req.body.token,
        }, 'id')
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        // console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Duplicate Unique Key (user, token)'
        })
    }
}

exports.updatePushKit = async (req, res) => {
    try {
        console.log(req.user.id, req.body)
        let result = await db.insert('pushkit', {
            'user': req.user.id,
            'token': req.body.token,
        }, 'id')
        return res.status(200).json({
            status: '200',
            message: 'Success Pushkit Token Updated',
            data: result
        })
    } catch (e) {
        // console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.clearChat = async (req, res) => {
    let {box} = req.params;
    try {
        let result = await db.delete2('thread', {
            conditions: [
                ['box', '=', box]
            ]
        })
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

async function getReceivers(thread){
    if(thread.channel){
        let result = await db.select('channel_member', {
            fields: ['user'],
            conditions: [
                ['channel', '=', thread.channel]
            ]
        })
        let users = [];
        result.forEach(e => {
            if(e.user != thread.sender){
                users.push(e.user)
            }
        })
        return users;
    }
    if(thread.group){
        let result = await db.select('group_member', {
            fields: ['user'],
            conditions: [
                ['group', '=', thread.group]
            ]
        })
        let users = [];
        result.forEach(e => {
            // if(e.user != thread.sender){
                users.push(e.user)
            // }
        })
        return users;
    } else {
        try{
            if(thread.sender != null && thread.sender != undefined ){
                return [thread.receiver, thread.sender];
            } 
            return [thread.receiver];
        } catch(e){
            return [thread.receiver];
        }
        
    }
}

async function filterReceivers(receivers, box){
    let prefs = await db.select('notification', {
        fields: ['*'],
        conditions: [
            ['owner', 'in', receivers],
            ['box', '=', box]
        ]
    })
    let map = {};
    prefs.forEach(e => {
        map[e.owner] = e;
    })
    let filtered = [];
    receivers.forEach(e => {
        let ee = map[e]
        if(ee){
            let d = ee.data || {}
            if(d.mute != true){
                filtered.push(e)
            }
        } else {
            filtered.push(e)
        }
    })
    return filtered;
}

exports.getUsers = async (req, res) => {
    var ids = req.body.ids;
    try {
        // remove all null, undefined, and empty strings
        ids = ids.filter(function (el) {
            return el != null && el != undefined && el != '' && el != 'null';
        });

        let result = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', 'in', ids]
            ]
        })
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.getUser = async (req, res) => {
    let id = req.params.id;
    let username = req.body.username;

    try {
        if(username){
            let a = await db.select('account', {
                fields: ['*'],
                conditions: [
                    ['uname', '=', username]
                ]
            })
            if(a.length > 0){
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: a[0]
                })
            } else {
                return res.status(404).json({
                    status: '404',
                    message: 'Not Found'
                })
            }
        } else {
            let result = await db.fun('get_user', {
                params: `${req.user.id},${id}`
            })
            if(result.length > 0){
                let post = await db.count('post', {
                    conditions:[
                        ['owner', '=', id]
                    ]
                })
                let u = result[0]['get_user']
                u.posts = post[0].count;
                // console.log(u)
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: u
                })
            } else {
                return res.status(404).json({
                    status: '404',
                    message: 'Not Found'
                })
            }
        }   
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }

}
async function getTokens(user){
    let tokens = []
    var result;
    if(Array.isArray(user)){
        result = await db.select('fcm', {
            fields: ['token'],
            conditions: [
                ['user', 'in', user]
            ]
        })
    } else {
        result = await db.select('fcm', {
            fields: ['token'],
            conditions: [
                ['user', '=', user]
            ]
        })
    }
    
    result.forEach(e => {
        tokens.push(e.token)
    })
    return tokens;
}

async function getPushKitTokens(user){
    let tokens = []
    var result;
    if(Array.isArray(user)){
        result = await db.select('pushkit', {
            fields: ['token'],
            conditions: [
                ['user', 'in', user]
            ]
        })
    } else {
        result = await db.select('pushkit', {
            fields: ['token'],
            conditions: [
                ['user', '=', user]
            ]
        })
    }
    
    result.forEach(e => {
        tokens.push(e.token)
    })
    return tokens;
}

function now(){
    return `${new Date().toISOString()}`
}


exports.getReceivers = getReceivers;
exports.getTokens = getTokens;
exports.getPushKitTokens = getPushKitTokens;
exports.notifyMessage = sendMessage;
exports.now = now;