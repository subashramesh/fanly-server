const db = require('../service/chat/postgres')
const socket = require('./chat_socket.js')

const chat = require('./chat.js')

exports.createChannel = async (req, res) => {
    let body = req.body;
    let channel = {
        name: body.name,
        data: body.data,
        owner: req.user.id,
        updated_at: new Date()
    };

    try {
        let members = body.members || [];
        let admins = body.admins || [];

        let result = await db.insert('channel', channel, 'id');
        if(result.length > 0){
            channel.id = result[0].id;
            channel.admins = [];
            channel.members = [];
            let payload = {
                channel: channel.id,
                user: req.user.id
            }
            channel.members.push(payload);
            channel.admins.push(payload);
            await db.insert('channel_member', payload, 'id');
            await db.insert('channel_admin', payload, 'id');
            for(let i = 0; i < members.length; i++){
                let payload = {
                    channel: channel.id,
                    user: members[i].id
                }
                channel.members.push(payload);
                await db.insert('channel_member', payload, 'id');
            }
            for(let i = 0; i < admins.length; i++){
                let payload = {
                    channel: channel.id,
                    user: admins[i].id
                }
                channel.admins.push(payload);
                await db.insert('channel_admin', payload, 'id');
            }

            channel.created_at = new Date();

            let receivers = await chat.getReceivers({
                channel: channel.id,
            })
            receivers.push(req.user.id)
            socket.send(receivers, 'channel', channel);

            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: channel
            })
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
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

exports.updateChannel = async (req, res) => {
    let {id} = req.params;
    let body = req.body;
    let channel = {
        name: body.name,
        data: body.data,
        updated_at: new Date()
    };

    try {
        let ch = await db.select('channel', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        });

        if(ch.length == 0){
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            })
        }
        if(ch[0].owner != req.user.id){
            return res.status(403).json({
                status: '403',
                message: 'Forbidden'
            })
        }

        let result = await db.update('channel', {
            fields: channel,
            conditions: [
                ['id', '=', id]
            ]
        });
        if(result){
            let receivers = await chat.getReceivers({
                channel: id,
            })
            socket.send(receivers, 'channel', channel);
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: channel
            })
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            })
        }
    } catch (e){
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }

}

exports.followChannel = async (req, res) => {
    let {id} = req.params;

    try {
        let payload = {
            channel: id,
            user: req.user.id
        }
        let r = await db.insert('channel_member', payload, 'id');
        if(r.length > 0){
            payload.id = r[0].id;
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
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.unfollowChannel = async (req, res) => {
    let {id} = req.params;
    try{
        let r = await db.delete2('channel_member', {
            conditions: [
                ['channel', '=', id],
                ['user', '=', req.user.id]
            ]
        });
        if(r){
            return res.status(200).json({
                status: '200',
                message: 'Success'
            })
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
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

async function processChannels(channels){
    let ids = channels.map((e) => e.id)
    let members = await db.select('channel_member', {
        fields: ['*'],
        conditions: [
            ['channel', 'in', ids]
        ]
    });
    for(let i = 0; i < channels.length; i++){
        channels[i].followers = 0;
        for(let j = 0; j < members.length; j++){
            if(channels[i].id == members[j].channel){
                channels[i].followers++;
            }
        }
    }
    return channels;
}

exports.getChannels = async (req, res) => {
    try {
        let channels = await db.select('channel', {
            fields: ['*'],
            conditions: []
        });

        let ids = channels.map((e) => e.id)
        let members = await db.select('channel_member', {
            fields: ['*'],
            conditions: [
                ['channel', 'in', ids],
                ['user', '=', req.user.id]
            ]
        });
        for(let i = 0; i < channels.length; i++){
            for(let j = 0; j < members.length; j++){
                if(channels[i].id == members[j].channel){
                    channels[i].follow = true;
                }
                
            }
        }
        let data = await processChannels(channels);
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: data
        })
    } catch (e){
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.getMyChannels = async (req, res) => {
    try {
        let channels = await db.select('channel', {
            fields: ['*'],
            conditions: [
                ['owner', '=', req.user.id]
            ]
        });

        let ids = channels.map((e) => e.id)
        let members = await db.select('channel_member', {
            fields: ['*'],
            conditions: [
                ['channel', 'in', ids],
                ['user', '=', req.user.id]
            ]
        });

        for(let i = 0; i < channels.length; i++){
            for(let j = 0; j < members.length; j++){
                if(channels[i].id == members[j].channel){
                    channels[i].follow = true;
                }
            }
        }
        let data = await processChannels(channels);
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: data
        })
    } catch (e){
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.getFollowedChannels = async (req, res) => {
    try {
        let m = await db.select('channel_member', {
            fields: ['channel'],
            conditions: [
                ['user', '=', req.user.id]
            ]
        });

        let ids = m.map((e) => e.channel)

        let channels = await db.select('channel', {
            fields: ['*'],
            conditions: [
                ['id', 'in', ids]
            ]
        });

        for(let i = 0; i < channels.length; i++){
            channels[i].follow = true;
        }
        let data = await processChannels(channels);
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: data
        })
    } catch (e){
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.deleteChannel = async (req, res) => {
    let {id} = req.params;
    try {
        let ch = await db.select('channel', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        });

        if(ch.length == 0){
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            })
        }
        if(ch[0].owner != req.user.id){
            return res.status(403).json({
                status: '403',
                message: 'Forbidden'
            })
        }

        let result = await db.delete2('channel', {
            conditions: [
                ['id', '=', id]
            ]
        });
        if(result){
            return res.status(200).json({
                status: '200',
                message: 'Success'
            })
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            })
        }
    } catch (e){
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.newBroadcast = async (req, res) => {
    let body = req.body;
    let payload = {
        name: body.name,
        data: body.data,
        owner: req.user.id,
        updated_at: new Date()
    };
    let members = body.members || [];
    let membersIds = members.map((e) => e.id);
    payload.members = membersIds;
    let groupIds = body.groups || [];
    payload.groups = groupIds.map((e) => e.id);

    try {
        let result = await db.insert('broadcast', payload, 'id');
        payload.id = result[0].id;
        payload.created_at = new Date();
        payload.members = members;
        payload.admins = [{
            id: req.user.id
        }]
        return res.send({
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

exports.deleteBroadcast = async (req, res) => {
    let {id} = req.params;
    try {
        let ch = await db.select('broadcast', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        });

        if(ch.length == 0){
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            })
        }
        if(ch[0].owner != req.user.id){
            return res.status(403).json({
                status: '403',
                message: 'Forbidden'
            })
        }

        let result = await db.delete2('broadcast', {
            conditions: [
                ['id', '=', id]
            ]
        });
        if(result){
            return res.status(200).json({
                status: '200',
                message: 'Success'
            })
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            })
        }
    } catch (e){
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }

}

exports.    updateBroadcast = async (req, res) => {
    let {id} = req.params;
    let body = req.body;
    let payload = {
        name: body.name,
        data: body.data,
        updated_at: new Date()
    };
    let members = body.members || [];
    let membersIds = members.map((e) => e.id);
    payload.members = membersIds;

    try {
        let ch = await db.select('broadcast', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        });

        if(ch.length == 0){
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            })
        }
        if(ch[0].owner != req.user.id){
            return res.status(403).json({
                status: '403',
                message: 'Forbidden'
            })
        }

        let result = await db.update('broadcast', {
            fields: payload,
            conditions: [
                ['id', '=', id]
            ]
        });
        if(result){
            payload.id = id;
            payload.created_at = ch[0].created_at;
            payload.members = members;
            payload.admins = [{
                id: req.user.id
            }]
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
    } catch (e){
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }


}

exports.getBroadcasts = async (req, res) => {
    let user = req.user.id;
    try {
        let result = await db.select('broadcast', {
            fields: ['*'],
            conditions: [
                ['owner', '=', user]
            ]
        });
        let memberIds = []
        for(let e of result){
            memberIds.push(...e.members);
        }
        let users = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', 'in', memberIds]
            ]
        });
        let userMap = {};
        for(let e of users){
            userMap[e.id] = e;
        }
        let groupIds = []
        for(let e of result){
            if(e.groups){
                groupIds.push(...e.groups);
            }
        }
        let groups = await db.select('group', {
            fields: ['*'],
            conditions: [
                ['id', 'in', groupIds]
            ]
        });
        let groupMap = {};
        for(let e of groups){
            groupMap[e.id] = e;
        }
        for(let e of result){
            if(e.groups){
                e.groups = e.groups.map((e) => groupMap[e]);
            }
        }

        for(let e of result){
            e.members = e.members.map((e) => userMap[e]);
            e.admins = [{
                id: e.owner
            }]
        }
        return res.send({
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