// import { AccessToken } from 'livekit-server-sdk';
const db = require('../service/chat/postgres')
const token = require('../middleware/auth')
const socket = require('./chat_socket.js')
const manager = require('./manager.js')
const chat = require('./chat.js')
const { ThreadEventType } = require('../consts/enums.js');
//import a es6 class




exports.createGroup = async (req, res) => {
    let body = req.body;
    let group = {
        name: body.name,
        data: body.data,
        owner: req.user.id,
        updated_at: chat.now(),
        created_at: chat.now()
    };

    try {
        let members = body.members || [];
        let admins = body.admins || [];

        let result = await db.insert('group', group, 'id');
        if (result.length > 0) {
            group.id = result[0].id;
            group.admins = [];
            group.members = [];
            let payload = {
                group: group.id,
                user: req.user.id
            }
            group.members.push(payload);
            group.admins.push(payload);
            await db.insert('group_member', payload, 'id');
            await db.insert('group_admin', payload, 'id');
            for (let i = 0; i < members.length; i++) {
                let payload = {
                    group: group.id,
                    user: members[i].id
                }
                group.members.push(payload);
                try {
                    await db.insert('group_member', payload, 'id');
                } catch (_) { }

            }
            for (let i = 0; i < admins.length; i++) {
                let payload = {
                    group: group.id,
                    user: admins[i].id
                }
                group.admins.push(payload);
                try {
                    await db.insert('group_admin', payload, 'id');
                } catch (_) { }

            }

            group.created_at = chat.now();

            let receivers = await chat.getReceivers({
                group: group.id,
            })
            let mm = group.members;
            let aa = group.admins;
            group.members = mm.map(e => {
                return { id: e.user };
            });
            group.admins = aa.map(e => {
                return { id: e.user };
            });

            receivers.push(req.user.id)
            socket.send(receivers, 'group', group);


            if (body.post) {
                let post = body.post;
                let payload = {
                    group: group.id,
                }

                db.update('post', {
                    fields: payload,
                    conditions: [
                        ['id', '=', post]
                    ]
                })
            }
            manager.send(req, ThreadEventType.createGroup, null, group.id)

            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: group
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

exports.updateGroup = async (req, res) => {
    let body = req.body;
    var group = {
        id: req.params.id,
        updated_at: chat.now()
    };
    if (body.name) group.name = body.name;
    if (body.data) group.data = body.data;

    try {
        let m = body.members || [];
        let a = body.admins || [];
        let rm = body.remove_members || [];
        let ra = body.remove_admins || [];


        let g = await db.select('group', {
            fields: ['*'],
            conditions: [
                ['id', '=', group.id]
            ]
        });
        if (g.length > 0) {
            let ggg = g[0];
            var picChange = false, titleChange = false, descChange = false;
            if (body.name && ggg.name != body.name) {
                titleChange = true;
            }
            if (body.data && ggg.data.desc != body.data.desc) {
                descChange = true;
            }
            if (body.data && ggg.data.avatar != body.data.avatar) {
                picChange = true;
            }
            if (titleChange) {
                manager.send(req, ThreadEventType.changeGroupTitle, req.user.id, group.id)
            }
            if (descChange) {
                manager.send(req, ThreadEventType.changeGroupDescription, req.user.id, group.id)
            }
            if (picChange) {
                manager.send(req, ThreadEventType.changeGroupAvatar, req.user.id, group.id)
            }
            await db.update('group', {
                fields: group,
                conditions: [
                    ['id', '=', group.id]
                ]
            });
            let gg = await db.select('group', {
                fields: ['*'],
                conditions: [
                    ['id', '=', group.id]
                ]
            });
            group = gg[0]
            var members = [];
            var admins = [];
            var remove_members = [];
            var remove_admins = [];
            var aids = [];

            for (let i = 0; i < m.length; i++) {
                let payload = {
                    group: group.id,
                    user: m[i].id
                }
                members.push(payload);
            }
            for (let i = 0; i < a.length; i++) {
                let payload = {
                    group: group.id,
                    user: a[i].id
                }
                aids.push(a[i].id)
                admins.push(payload);
            }
            for (let i = 0; i < rm.length; i++) {
                remove_members.push(rm[i].id);
            }
            for (let i = 0; i < ra.length; i++) {
                remove_admins.push(ra[i].id);
            }

            if (remove_members.length > 0) {
                for (let e of remove_members) {
                    manager.send(req, ThreadEventType.removeMember, e, group.id)
                }
                await db.delete2('group_member', {
                    conditions: [
                        ['group', '=', group.id],
                        ['user', 'in', remove_members]
                    ]
                })
                let rp = [];
                for (let i = 0; i < remove_members.length; i++) {
                    rp.push({
                        group: group.id,
                        owner: remove_members[i]
                    })
                }
                await db.knex('group_carbon').insert(rp).onConflict(['group', 'owner']).merge();
            }
            if (remove_admins.length > 0) {
                for (let e of remove_admins) {
                    //check aids if he is already admin
                    if (aids.indexOf(e) == -1) {

                    } else {
                        manager.send(req, ThreadEventType.removeAdmin, e, group.id)
                    }
                }
                await db.delete2('group_admin', {
                    conditions: [
                        ['group', '=', group.id],
                        ['user', 'in', remove_admins]
                    ]
                })
            }

            if (members.length > 0) {
                for (let e of members) {
                    manager.send(req, ThreadEventType.addMember, e.user, group.id)
                }
                await db.insert('group_member', members, 'id')
            }
            if (admins.length > 0) {
                for (let e of admins) {
                    manager.send(req, ThreadEventType.addAdmin, e.user, group.id)
                }
                await db.insert('group_admin', admins, 'id')
            }

            let receivers = await chat.getReceivers({
                group: group.id,
            })
            console.log(group)
            members = await db.select('group_member', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group.id]
                ]
            })
            admins = await db.select('group_admin', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group.id]
                ]
            })
            group.members = members;
            group.admins = admins;

            receivers.push(req.user.id)
            for (let i = 0; i < remove_members.length; i++) {
                receivers.push(remove_members[i])
            }

            socket.send(receivers, 'group_update', group);
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: group
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

exports.leaveGroup = async (req, res) => {
    let body = req.body;
    let group = req.params.id;

    try {
        let groups = await db.select('group', {
            fields: ['*'],
            conditions: [
                ['id', '=', group]
            ]
        })
        if (groups.length > 0) {
            group = groups[0];
            let result = await db.select('group_member', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group.id],
                    ['user', '=', req.user.id]
                ]
            })
            if (result.length > 0) {
                let member = result[0];
                await db.knex('group_carbon').insert({
                    group: group.id,
                    owner: req.user.id
                }).onConflict(['group', 'owner']).merge();
                await db.delete2('group_member', {
                    conditions: [
                        ['id', '=', member.id]
                    ]
                })
                await db.delete2('group_admin', {
                    conditions: [
                        ['group', '=', group.id],
                        ['user', '=', req.user.id]
                    ]
                })

                let ads = await db.select('group_admin', {
                    fields: ['*'],
                    conditions: [
                        ['group', '=', group.id]
                    ]
                })

                if (ads.length == 0) {
                    let m = await db.select('group_member', {
                        fields: ['*'],
                        conditions: [
                            ['group', '=', group.id]
                        ]
                    })
                    if (m.length > 0) {
                        let a = await db.insert('group_admin', {
                            'user': m[0].user,
                            'group': group.id
                        }, 'id');
                        await db.update('group', {
                            fields: {
                                owner: m[0].user
                            },
                            conditions: [
                                ['id', '=', group.id]
                            ]
                        })
                    }
                }

                let payload = {
                    group: group.id,
                    user: req.user.id
                }
                let receivers = await chat.getReceivers({
                    group: group.id,
                })
                manager.send(req, ThreadEventType.leaveGroup, req.user.id, group.id)
                socket.send(receivers, 'group_leave', payload);
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: payload
                })
            } else {
                return res.status(404).json({
                    status: '404',
                    message: 'Member not found',
                    data: {}
                })
            }
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Group not found',
                data: {}
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.deleteGroup = async (req, res) => {
    let group = req.params.id;

    try {
        let res = await db.select('group', {
            fields: ['*'],
            conditions: [
                ['id', '=', group],
                ['owner', '=', req.user.id]
            ]
        })
        if (res.length > 0) {
            let g = res[0];
            await db.update('group', {
                fields: {
                    updated_at: chat.now(),
                    owner: null
                },
                conditions: [
                    ['id', '=', g.id]
                ]
            })
        }

        await db.delete2('group_carbon', {
            conditions: [
                ['group', '=', group],
                ['owner', '=', req.user.id]
            ]
        })
        await db.delete2('group_member', {
            conditions: [
                ['group', '=', group],
                ['user', '=', req.user.id]
            ]
        })
        await db.delete2('group_admin', {
            conditions: [
                ['group', '=', group],
                ['user', '=', req.user.id]
            ]
        })
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: {}
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

0

exports.requestGroup = async (req, res) => {
    let body = req.body;
    let room = body.id;

    try {
        let groups = await db.select('group', {
            fields: ['*'],
            conditions: [
                ['room', '=', room]
            ]
        })
        if (groups.length > 0) {
            let group = groups[0];
            let members = await db.select('group_member', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group.id],
                    ['user', '=', req.user.id]
                ]
            })
            if (members.length > 0) {


                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: true
                })
            } else {
                let payload = {
                    group: group.id,
                    user: req.user.id
                }
                let result = await db.insert('group_request', payload, 'id');
                payload.id = result[0].id;

                socket.send(group.owner, 'group_request', payload);

                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: false
                })
            }
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Room not found',
                data: false
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error',
            data: false
        })
    }
}

exports.getRequests = async (req, res) => {
    let body = req.body;
    let group = req.params.id;

    try {
        let groups = await db.select('group', {
            fields: ['*'],
            conditions: [
                body.id ? ['room', '=', body.id] : ['id', '=', group],
                ['owner', '=', req.user.id]
            ]
        })
        if (groups.length > 0) {
            group = groups[0].id;
            let result = await db.select('group_request', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group]
                ]
            })
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: result
            })
        } else {
            return res.status(403).json({
                status: '403',
                message: 'Forbidden',
                data: []
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error',
            data: []
        })
    }
}

exports.acceptRequest = async (req, res) => {
    let body = req.body;
    let group = req.params.id;

    try {
        let groups = await db.select('group', {
            fields: ['*'],
            conditions: [
                ['id', '=', group],
                ['owner', '=', req.user.id]
            ]
        })
        if (groups.length > 0) {
            group = groups[0].id;
            let result = await db.select('group_request', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group],
                    ['id', '=', body.id]
                ]
            })
            if (result.length > 0) {
                let request = result[0];
                let payload = {
                    group: group,
                    user: request.user
                }
                await db.insert('group_member', payload, 'id')
                await db.delete2('group_request', {
                    conditions: [
                        ['id', '=', request.id]
                    ]
                })
                socket.send(payload.user, 'group_request_accept', request);
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: request
                })
            } else {
                return res.status(404).json({
                    status: '404',
                    message: 'Request not found',
                    data: {}
                })
            }
        } else {
            return res.status(403).json({
                status: '403',
                message: 'Forbidden',
                data: {}
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }

}

exports.declineRequest = async (req, res) => {
    let body = req.body;
    let group = req.params.id;

    try {
        let groups = await db.select('group', {
            fields: ['*'],
            conditions: [
                ['id', '=', group],
                ['owner', '=', req.user.id]
            ]
        })
        if (groups.length > 0) {
            group = groups[0].id;
            let result = await db.select('group_request', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group],
                    ['id', '=', body.id]
                ]
            })
            if (result.length > 0) {
                let request = result[0];
                await db.delete2('group_request', {
                    conditions: [
                        ['id', '=', request.id]
                    ]
                })
                socket.send(request.user, 'group_request_decline', request);
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: request
                })
            } else {
                return res.status(404).json({
                    status: '404',
                    message: 'Request not found',
                    data: {}
                })
            }
        } else {
            return res.status(403).json({
                status: '403',
                message: 'Forbidden',
                data: {}
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }

}

exports.meetChallenge = async (req, res) => {
    let body = req.body;
    let room = body.id;

    try {
        let result = await db.select('group', {
            fields: ['*'],
            conditions: [
                ['room', '=', room]
            ]
        })
        if (result.length > 0) {
            let group = result[0];
            let receivers = await chat.getReceivers({
                group: group.id,
            })
            var members = await db.select('group_member', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group.id]
                ]
            })
            let admins = await db.select('group_admin', {
                fields: ['*'],
                conditions: [
                    ['group', '=', group.id]
                ]
            })


            var isMember = false;

            for (let i = 0; i < members.length; i++) {
                if (members[i].user == req.user.id) {
                    isMember = true;
                    break;
                }
            }

            if (!isMember) {
                try {
                    let m = await db.insert('group_member', {
                        'user': req.user.id,
                        'group': group.id
                    }, 'id');
                    members.push({
                        user: req.user.id,
                        group: group.id,
                        id: m[0].id
                    });
                } catch (e) { }
            }
            group.members = members;
            group.admins = admins;

            receivers.push(req.user.id)
            socket.send(receivers, 'group_update', group);
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: group
            })
        } else {
            let group = {
                name: body.name,
                room: body.id,
                data: body.data,
                owner: req.user.id,
                created_at: chat.now(),
                updated_at: chat.now()  
            }
            let g = await db.insert('group', group, 'id');
            group.id = g[0].id;
            let m = await db.insert('group_member', {
                'user': req.user.id,
                'group': group.id
            }, 'id');
            let a = await db.insert('group_admin', {
                'user': req.user.id,
                'group': group.id
            }, 'id');
            group.members = [{
                user: req.user.id,
                group: group.id,
                id: m[0].id
            }];
            group.admins = [{
                user: req.user.id,
                group: group.id,
                id: a[0].id
            }];
            let receivers = await chat.getReceivers({
                group: group.id,
            })
            receivers.push(req.user.id)
            socket.send(receivers, 'group', group);
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: group
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