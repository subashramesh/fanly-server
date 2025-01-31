const db = require('../service/chat/postgres')
const chat = require('./chat.js')
const socket = require('./chat_socket.js')
const messaging = require('../service/firebase/messaging.js')
const manager = require('./manager.js')
const { ThreadEventType } = require('../consts/enums.js');
const aps = require('../service/aps/aps.js')
const uuid = require('uuid')
const { Rooms, CallRooms } = require('./rooms.js')

const rooms = new Rooms()
const callRooms = new CallRooms()

const callEvents = {
    call: 0,
    accept: 1,
    reject: 2,
    add: 3,
    remove: 4,
    end: 5,
};

exports.rooms = rooms;



exports.call = async (req, res) => {
    let body = req.body;
    let call = {
        caller: req.user.id,
        receiver: body.receiver,
        type: body.type,
        group: body.group,
    };

    console.log('call', call)

    await callRooms.setUserBusy(req.user.id)

    try {
        if (call.group) {
            let active = await db.select('call', {
                fields: ['*'],
                conditions: [
                    ['group', '=', call.group],
                    ['ended', '=', false]
                ]
            })
            let act = await rooms.isActive(`g-${call.group}`)
            if (active.length > 0 && act) {
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: active[0]
                });
            }
        } else {
            // check if user is busy
            
        }
        let result = await db.insert('call', call, 'id');
        if (result.length > 0) {
            call.id = result[0].id;
            call.created_at = new Date();
            call.sender = call.caller
            console.log(call)
            let receivers = await chat.getReceivers(call)
            var roomId;
            if (call.group) {
                roomId = `g-${call.group}`
            } else {
                roomId = manager.getConversationId(call.caller, call.receiver)
            }
            rooms.add(roomId, call.caller)


            // remove caller from receivers
            receivers = receivers.filter(receiver => receiver !== call.caller)
            rooms.inviteAll(roomId, receivers)


            let tokens = await chat.getTokens(receivers)

            var gg;
            if (call.group) {
                let ff = await db.select('group', {
                    fields: ['*'],
                    conditions: [
                        ['id', '=', call.group]
                    ]
                })
                if (ff.length > 0) {
                    gg = ff[0]
                }
            }

            if (tokens.length > 0 || true) {
                let payload = {
                    type: 'call',
                    data: JSON.stringify(call),
                }
                if (gg) {
                    //iterate receivers
                    for (let index = 0; index < receivers.length; index++) {
                        const e = receivers[index];
                        let name = await chat.getName(call.caller, e)
                        let tt = await chat.getTokens(e)
                        let pushkit = await chat.getPushKitTokens(e)
                        if (pushkit.length > 0) {
                            for (let i = 0; i < pushkit.length; i++) {
                                const e = pushkit[i];
                                // generate uuid for call
                                call.uuid = uuid.v4()
                                call['caller_id'] = req.user.phone
                                call['caller_name'] = gg.name
                                call['caller_id_type'] = 'number'
                                call['has_video'] = true
                                aps.sendVoip(e, call)
                            }
                        } else {
                            messaging.message(tt, payload, {
                                title: `${name}`,
                                body: `Incoming call from ${gg.name}`,
                                android: {
                                    notification: {
                                        channelId: 'channelId100',
                                    }
                                }
                            })
                        }
                    }
                    // messaging.message(tokens, payload, {
                    //     title: `${req.user.dname}`,
                    //     body: `Incoming call from ${gg.name}`,
                    //     sound: 'call.aiff',
                    //     android_channel_id: 'channelId100',
                    // })                                                                                          
                } else {
                    let busy = await callRooms.isUserBusy(call.receiver)
                    if(busy) {
                        socket.send(call.caller, 'engaged', call);
                        return res.status(200).json({
                            status: '200',
                            message: 'Success',
                            data: call
                        });
                    } else {
                        await callRooms.setUserBusy(call.receiver)
                    }
                    // messaging.message(tokens, payload, null);
                    // let name  = await chat.getName(call.caller, call.receiver)

                    console.log(`Call receivers: ${receivers}`)
                    let pushkit = await chat.getPushKitTokens(receivers)
                    console.log('pushkit', pushkit)

                    var account;

                    let aa = await db.select('account', {
                        fields: ['*'],
                        conditions: [
                            ['id', '=', req.user.id]
                        ]
                    })

                    if (aa.length > 0) {
                        account = aa[0]
                    }

                    if (pushkit.length > 0 && account) {
                        for (let i = 0; i < pushkit.length; i++) {
                            const e = pushkit[i];
                            // generate uuid for call
                            call.uuid = uuid.v4()
                            call['caller_id'] = account.dname
                            call['caller_name'] = account.dname
                            call['caller_id_type'] = 'number'
                            call['has_video'] = true
                            console.log('voip call:', call)
                            aps.sendVoip(e, call)
                        }
                    } else {
                        console.log('Push kit is empty')
                        // messaging.message(tokens, payload, null)
                        // {
                        //     title: name,
                        //     body: 'Incoming call',
                        //     sound: 'call.aiff',
                        //     android_channel_id: 'channelId100',
                        // }
                    }

                    console.log('calling', tokens, payload)
                    messaging.message(tokens, payload, {
                        title: '',
                        body: '',
                        android: {
                            notification: {
                                channelId: 'channelId100',
                            }
                        }
                    })

                }

            }

            socket.send(receivers, 'call', call);

            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: call
            });
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.join = async (req, res) => {
    let call = req.params.id;
    let user = req.user.id;
    let payload = {
        call,
        user,
        updated_at: new Date()
    }

    try {
        let result = await db.knex('call_member').insert(payload, 'id').onConflict(['call', 'user']).merge()
        payload.id = result[0].id
        payload.created_at = new Date()

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })

        let c = req.body
        var roomId
        if (c.group) {
            roomId = `g-${c.group}`
        } else {
            roomId = manager.getConversationId(c.caller, c.receiver)
        }
        rooms.add(roomId, user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.invite = async (req, res) => {
    let sender = req.user.id;
    let call = req.params.id;
    let user = req.body.user || req.query.user;

    if (user === undefined) {
        return res.status(400).json({
            status: '400',
            message: 'Bad Request'
        });
    }

    try {
        let callData = await db.select('call', {
            fields: ['*'],
            conditions: [
                ['id', '=', call]
            ]
        })

        if (callData.length === 0) {
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            });
        }

        let members = await db.select('call_member', {
            fields: ['user'],
            conditions: [
                ['call', '=', call]
            ]
        })

        await db.knex('call_member').insert({
            call,
            user: user,
            updated_at: new Date()
        }, 'id').onConflict(['call', 'user']).merge()

        let ids = members.map(member => member.user)
        var users = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', 'in', ids]
            ]
        })
        let tokens = await chat.getTokens(user)

        users = users.map(e => {
            delete e.data
            delete e.categories
            delete e.device
            return e
        })

        let payload = callData[0]
        let uu = req.user
        delete uu.data
        delete uu.categories
        delete uu.device
        payload.invite = uu
        payload.members = users
        payload.room = manager.getConversationId(payload.caller, payload.receiver)
        payload.created_at = new Date()

        rooms.invite(payload.room, user)

        let pushkit = await chat.getPushKitTokens(user);
        var account;

        let aa = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', '=', req.user.id]
            ]
        })

        if (aa.length > 0) {
            account = aa[0]
        }

        if (pushkit.length > 0 && account) {
            for (let i = 0; i < pushkit.length; i++) {
                const e = pushkit[i];
                // generate uuid for call
                var pp = {}

                pp.uuid = uuid.v4()
                pp.caller = payload.caller
                pp.receiver = payload.receiver
                pp.type = 1
                pp.id = payload.id
                pp.created_at = payload.created_at
                pp.sender = payload.caller
                pp.room = payload.room


                // pp['caller_id'] = account.normalized
                pp['caller_id'] = account.dname
                pp['caller_id_type'] = 'generic'
                pp['has_video'] = true
                console.log('voip call:', pp)
                aps.sendVoip(e, pp)
            }
        } else {
            if (tokens.length > 0) {
                console.log('sending invite')
                let message = {
                    type: 'call_invite',
                    data: JSON.stringify(payload),
                }
                let name = await chat.getName(req.user.id, user)
                messaging.message(tokens, message, {
                    title: `${name}`,
                    body: 'Group call invite, tap to join',
                    android: {
                        notification: {
                            channelId: 'channelId100',
                        }
                    }
                })
            }
        }

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.isActive = async (req, res) => {
    let id = req.params.id;

    try {
        let active = await db.select('call', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (active.length > 0) {
            let payload = active[0]
            if(payload.group){
                let act = await rooms.isActive(`g-${payload.group}`)
                payload.active = act
            } else {
                let act = await rooms.isActive(manager.getConversationId(payload.caller, payload.receiver))
                payload.active = act
            }
            console.log('is active', payload)
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: payload.active
            });
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.accept = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    try {
        let payload = {
            call: id,
            user: req.user.id,
            type: callEvents.accept
        }

        let mp = {
            call: id,
            user: req.user.id,
            updated_at: new Date()
        }

        let result = await db.insert('call_event', payload, 'id');

        try {
            await db.knex('call_member').insert(mp, 'id').onConflict(['call', 'user']).merge()
        } catch (e) {
            console.log(e)
        }

        if (result.length > 0) {
            payload.id = result[0].id;
            payload.created_at = new Date();
            // let receivers = await chat.getReceivers(body)
            socket.send([req.user.id], 'call_acknowledge', payload);

            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: payload
            });
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.reject = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    try {
        let payload = {
            call: id,
            user: req.user.id,
            type: callEvents.reject
        }

        let result = await db.insert('call_event', payload, 'id');

        if (result.length > 0) {
            payload.id = result[0].id;
            payload.created_at = new Date();
            let receivers = await chat.getReceivers(body)
            receivers.push(body.caller)
            callRooms.setUserAvailable(req.user.id)
            callRooms.setUserAvailable(body.caller)
            socket.send(receivers, 'call_event', payload);
            socket.send([req.user.id], 'call_acknowledge', payload);

            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: payload
            });
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.logs = async (req, res) => {
    let limit = req.query.limit || 1000;
    let offset = req.query.offset || 0;

    try {
        let groups = await db.select('group_member', {
            fields: ['group'],
            conditions: [
                ['user', '=', req.user.id]
            ]
        })
        let ids = groups.map(group => group.group)
        // let calls = await db.select('call', {
        //     fields: ['*'],
        //     conditions: [
        //         ['caller', '=', req.user.id],
        //     ],
        //     orWhere: [
        //         ['receiver', '=', req.user.id],
        //         ['group', 'in', ids]
        //     ],
        //     orderBy: 'created_at',
        //     order: 'DESC',
        // })

        var idsStr = '';
        for (let i = 0; i < ids.length; i++) {
            const e = ids[i];
            idsStr += `${e},`
        }
        idsStr = idsStr.slice(0, -1)

        let c = await db.knex.raw(`SELECT * FROM call WHERE caller = '${req.user.id}' OR receiver = '${req.user.id}' OR "group" IN (${idsStr}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`)
        let calls = c.rows
        let callIds = calls.map(call => call.id)
        let members = await db.select('call_member', {
            fields: ['*'],
            conditions: [
                ['call', 'in', callIds]
            ]
        })
        let memberIds = members.map(member => member.user)
        let users = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', 'in', memberIds]
            ]
        })
        let userMap = {}
        users.forEach(user => {
            userMap[user.id] = user
        })
        let events = await db.select('call_event', {

            fields: ['*'],
            conditions: [
                ['call', 'in', callIds]
            ]
        })
        calls.forEach(call => {
            call.members = members.filter(member => member.call === call.id).map(member => userMap[member.user])
            call.events = events.filter(event => event.call === call.id)
        })


        return res.send({
            status: '200',
            message: 'Success',
            data: calls
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }

}

exports.engage = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    try {
        if (body.group) {

        } else {
            socket.send(body.caller, 'engaged', body);
        }
        return res.status(200).json({
            status: '200',
            message: 'Engage Success',
            data: body
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.shake = async (req, res) => {
    let body = req.body;

    try {
        let receivers = await chat.getReceivers(body)
        if(body.caller){
            receivers.push(body.caller)
        }

        socket.send(receivers, 'shake', body);

        console.log('shaking', receivers, body)

        return res.status(200).json({
            status: '200',
            message: 'Shake Success',
            data: body
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.end = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    try {
        try {
            let payload = {
                call: id,
                user: req.user.id,
                type: callEvents.end
            }

            let result = await db.insert('call_event', payload, 'id');
        } catch (e) {
            console.log(e)
        }
        console.log('ending call', id, req.user.id)
        callRooms.setUserAvailable(req.user.id)
        callRooms.setUserAvailable(body.receiver)
        callRooms.setUserAvailable(body.caller)
        try {
            let receivers = await chat.getReceivers(body)
            let callMembers = await db.select('call_member', {
                fields: ['user'],
                conditions: [
                    ['call', '=', id]
                ]
            })

            let callUsers = callMembers.map(member => member.user)
            // add all call members to receivers
            receivers = receivers.concat(callUsers)

            // remove duplicates from receivers
            receivers = [...new Set(receivers)]

            let tokens = await chat.getTokens(receivers)
            var roomId;



            let payload = {
                type: 'call_end',
                data: JSON.stringify(body),
            }

            if (tokens.length > 0) {
                messaging.message(tokens, payload, null)
            }

            socket.send(receivers, 'ended', body);
        } catch (e) {
            console.log(e)
        }


        let members = await db.select('call_member', {
            fields: ['user'],
            conditions: [
                ['call', '=', id]
            ]
        })
        let rejects = await db.select('call_event', {
            fields: ['*'],
            conditions: [
                ['call', '=', id],
                ['type', '=', callEvents.reject]
            ]
        })
        let ids = members.map(member => member.user)
        if (body.group) {

        } else {
            console.log(ids, body)
            let attend = ids.filter(e => `${e}` === `${body.receiver}`)
            let declined = rejects.length > 0
            if (attend.length > 0) {
                manager.send(req, ThreadEventType.callEnd, body.receiver, null)
            } else {
                let u = body.receiver
                if (u === req.user.id) {

                } else {
                    console.log('missed call')
                    await db.update('call', {
                        fields: {
                            missed: true
                        },
                        conditions: [
                            ['id', '=', id]
                        ]
                    })
                    if (declined) {

                    } else {
                        console.log('sending missed call notification')
                        manager.send(req, ThreadEventType.missedCall, body.receiver, null)
                    }
                }
                if (declined) {
                    manager.send(req, ThreadEventType.declinedCall, body.receiver, null)
                }
            }
        }

        let rr = await db.select('call', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        });
        if (rr.length > 0) {
            let d = rr[0]
            if (d.group) {
                roomId = `g-${d.group}`
            } else {
                roomId = manager.getConversationId(d.caller, d.receiver)
            }
            rooms.remove(roomId, req.user.id)
        }



        return res.send({
            status: '200',
            message: 'Success',
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.endFull = async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    try {
        // ended to true
        await db.update('call', {
            fields: {
                ended: true
            },
            conditions: [
                ['group', '=', `${body.group}`]
            ]
        })

        var roomId;
        if (body.group) {
            roomId = `g-${body.group}`
        } else {
            roomId = manager.getConversationId(body.caller, body.receiver)
        }
        rooms.remove(roomId, req.user.id)

        return res.send({
            status: '200',
            message: 'Success',
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.activeCalls = async (req, res) => {
    if (req.user === undefined) {
        return res.status(401).json({
            status: '401',
            message: 'Unauthorized'
        });
    }
    let a = await rooms.activeRooms(req.user.id)
    return res.send({
        status: '200',
        message: 'Success',
        data: a
    })
}