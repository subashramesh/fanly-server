const db = require('../service/chat/postgres')
const socket = require('./chat_socket.js')
const { notify, revokeNotify } = require('./notification.js');
const { NotificationType, InteractionType } = require('../consts/enums.js');

exports.getLives = async function (req, res) {
    try{
        let channels = await db.select('channel_member', {
            fields: ['channel'],
            conditions: [
                ['user', '=', req.user.id]
            ]
        })

        let channelIds = channels.map(channel => channel.channel)

        let lives = await db.select('live', {
            fields: ['*'],
            conditions: [
                ['channel', 'in', channelIds],
                ['active', '=', true]
            ]
        })

        let liveChannelIds = lives.map(live => live.channel)

        let data = await db.select('channel', {
            fields: ['*'],
            conditions: [
                ['id', 'in', liveChannelIds]
            ]
        })

        let channelMap = {}
        data.forEach(channel => {
            channelMap[channel.id] = channel
        })

        lives.forEach(live => {
            live.channel = channelMap[live.channel]
        })

        res.send({
                status: '200',
                message: 'Success',
                data: lives
            })
    } catch(e){
        console.log(e)
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

exports.go = async function (req, res) {
    let { name, data, channel} = req.body
    let { id } = req.user

    let payload = {
        name,
        data,
        channel,
        owner: id,
        active: true,
        updated_at: new Date()
    }

    try {
        await db.update('live', {
            fields: {
                active: false
            },
            conditions: [
                ['channel', '=', channel]
            ]
        })
        let result = await db.knex('live').insert(payload, 'id')
        payload.id = result[0].id
        await db.insert('live_member', {
            live: payload.id,
            owner: id,
            updated_at: new Date()
        })



        // emitToLive(payload.id, 'live', payload, req)

        let mmm = await db.select('channel_member', {
            fields: ['*'],
            conditions: [
                ['channel', '=', channel]
            ]
        })

        try {
            var ids = mmm.map(e => e.user)
            socket.send(ids, 'live', payload)
            for(let e of ids){
                //dont send to self
                if(e === id) continue;
                await notify(req, e, NotificationType.live, {
                    sender: req.user.id,
                    channel: channel,
                })
            }
        } catch (e) {}
        

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
        
    } catch (e) {
        console.log(e)
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}
exports.stop = stop
 async function stop(req, res) {
    let {id} = req.params
    let owner = req.user.id

    try {
        let result = await db.select('live', {
            fields: ['*'],
            conditions: [
                ['id', '=', id],
                ['owner', '=', owner]
            ]
        })

        if (result.length === 0) {
            return res.status(403).send({
                status: '403',
                message: 'Forbidden',
            })
        }

        await db.update('live', {
            fields: {
                active: false
            },
            conditions: [
                ['id', '=', id]
            ]
        })
        let payload = result[0]
        payload.active = false

        let mmm = await db.select('channel_member', {
            fields: ['*'],
            conditions: [
                ['channel', '=', payload.channel]
            ]
        })
        let ids = mmm.map(e => e.user)
        socket.send(ids, 'live-stopped', payload)

        // await emitToLive(id, 'live-stopped', payload, req)

        return res.send({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

exports.join = async function (req, res) {
    let {id} = req.params
    let payload = {
        live: id,
        owner: req.user.id,
        updated_at: new Date()
    }

    try {
        let result = await db.knex('live_member').insert(payload, 'id').onConflict(['owner', 'live']).merge()
        payload.id = result[0].id

        await emitToLive(id, 'live-joined', payload, req)

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

exports.leave = async function (req, res) {
    let {id} = req.params
    let {id: user_id} = req.user

    try {
        let lives = await db.select('live', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (lives.length === 0) {
            return res.status(404).send({
                status: '404',
                message: 'Not Found',
            })
        }
        let live = lives[0]
        if(live.owner === user_id){
            await stop(req, {
                send: (s) => {},
                status: () => {
                    return {
                        send: (s) => {}
                    }
                }
            })
        }

        let result = await db.delete2('live_member', {
            conditions: [
                ['live', '=', id],
                ['owner', '=', user_id]
            ]
        })

        await emitToLive(id, 'live-left', {
            live: id,
            owner: user_id
        }, req)

        res.send({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

exports.react = async function (req, res) {
    let live = req.params.id
    let user = req.user
    let { type, text } = req.body
    let id = Date.now()

    let payload = {
        id,
        live,
        sender: user.id,
        user,
        type,
        text,
        updated_at: new Date()
    }

    await emitToLive(live, 'live-react', payload, req)

    return res.send({
        status: '200',
        message: 'Success',
        data: payload
    })
}

exports.members = async function (req, res) {
    let {id} = req.params

    try {
        let result = await db.select('live_member', {
            fields: ['*'],
            conditions: [
                ['live', '=', id]
            ]
        })
        let userIds = result.map(member => member.owner)
        let users = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', 'in', userIds]
            ]
        })
        res.send({
            status: '200',
            message: 'Success',
            data: users
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

exports.comment = async function (req, res) {
    let live = req.params.id
    let owner = req.user.id
    let { text, data} = req.body

    let payload = {
        live,
        owner,
        text,
        data,
        updated_at: new Date()
    }

    try{
        let result = await db.knex('live_comment').insert(payload, 'id').onConflict(['id']).merge()
        payload.id = result[0].id
        payload.user = req.user

        await emitToLive(live, 'live-comment', payload, req)

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

exports.comments = async function (req, res) {
    let {id} = req.params

    try {
        let result = await db.knex('live_comment').select('*').where('live', id)

        let userIds = result.map(comment => comment.owner)

        let users = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', 'in', userIds]
            ]
        })
        let userMap = {}
        users.forEach(user => {
            userMap[user.id] = user
        })
        result.forEach(comment => {
            comment.user = userMap[comment.owner]
        })

        res.send({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

async function emitToLive(live, event, data, req) {
    let members = await db.select('live_member', {
        fields: ['owner'],
        conditions: [
            ['live', '=', live]
        ]
    })
    let ids = members.map(member => member.owner)
    
    socket.send(ids, event, data)
    if(event === 'live'){
        
    }
    return;
}