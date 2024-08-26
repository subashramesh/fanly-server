require('dotenv').config();
const db = require('../service/chat/postgres')
const socket = require('./chat_socket.js')
const chat = require('./chat.js')
const { NotificationType, InteractionType, ThreadType } = require('../consts/enums.js');
const { notify, revokeNotify } = require('./notification.js');
const { getConversationId } = require('./manager')
const { notifyMessage } = require('./chat.js')

exports.createStatus = async (req, res) => {
    let body = req.body
    let payload = {
        user: req.user.id,
        type: body.type,
        data: body.data,
    }
    try {
        var privacy = {};

        try {
            let result = await db.select('status_privacy', {
                conditions: [
                    ['owner', '=', req.user.id]
                ],
                fields: ['*']
            })
            if (result.length) {
                privacy = result[0]
            } else {
                privacy = { type: 0, }
            }
            privacy.include = privacy.include || []
            privacy.exclude = privacy.exclude || []
        } catch (e) {
            console.log(e)
        }

        payload.privacy = privacy;
        let result = await db.insert('status', payload, 'id')
        payload.id = result[0].id
        payload.created_at = chat.now()

        let mentions = body.data.mentions;
        //check if mention is array data type
        if (Array.isArray(mentions)) {
            for (let e of mentions) {
                let box = getConversationId(req.user.id, e.id);
                let thread = {
                    sender: req.user.id,
                    receiver: e.id,
                    type: ThreadType.mention,
                    data: {
                        status: payload
                    },
                    created_at: chat.now(),
                    updated_at: chat.now(),
                    box: box
                }
                let result = await db.insert('thread', thread, 'id')
                thread.id = result[0].id
                notifyMessage(thread, req, null)
            }
        }

        res.status(200).json({
            status: '200',
            message: 'Success',
            data: payload
        })

        socket.emit('status', payload)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.get = async (req, res) => {
    let { id } = req.params
    try {
        let result = await db.select('status', {
            conditions: [
                ['id', '=', id]
            ]
        })
        if (result.length) {
            let ids = result.map((item) => item.id)
            let views = await db.select('status_view', {
                conditions: [
                    ['status', 'in', ids]
                ]
            })
            let likes = await db.select('status_like', {
                conditions: [
                    ['status', 'in', ids]
                ]
            })
            let status = result[0]
            let view = views.filter((item) => {
                if (item.user === req.user.id) {
                    status.viewed = true
                    return false
                }
                return item.status == status.id;
            })
            for (let e of likes) {
                if (e.status == status.id) {
                    if (e.owner == req.user.id) {
                        status.im_liking = true
                        break;
                    }
                    if (status.likes === undefined) {
                        status.likes = 1
                    } else {
                        status.likes += 1
                    }
                }
            }
            status.views = view
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: status
            })
        } else {
            res.status(404).json({
                status: '404',
                message: 'Not Found'
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

exports.getMyStatus = async (req, res) => {
    try {
        let limit = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()//.replace('Z', '-07')
        let result = await db.select('status', {
            conditions: [
                ['user', '=', req.user.id],
                // check if status is not expired 24 hours
                ['created_at', '>=', limit]
            ]
        })
        let ids = result.map((item) => item.id)
        let views = await db.select('status_view', {
            conditions: [
                ['status', 'in', ids]
            ]
        })
        let likes = await db.select('status_like', {
            conditions: [
                ['status', 'in', ids]
            ]
        })

        let data = []

        for (let i = 0; i < result.length; i++) {
            let status = result[i]
            let view = views.filter((item) => {
                if (item.user === req.user.id) {
                    status.viewed = true
                    return false
                }
                return item.status == status.id;
            })
            for (let e of likes) {
                if (e.status == status.id) {
                    if (e.owner == req.user.id) {
                        status.im_liking = true
                        break;
                    }
                    if (status.likes === undefined) {
                        status.likes = 1
                    } else {
                        status.likes += 1
                    }
                }
            }
            status.views = view
            data.push(status)
        }

        res.status(200).json({
            status: '200',
            message: 'Success',
            data: data
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.getFriendStatus = async (req, res) => {
    try {
        let con = await db.select('contact', {
            fields: ['*'],
            conditions: [
                ['user', '=', req.user.id]
            ]
        })
        let phones = con.map((item) => item.phone)

        let acc = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['normalized', 'in', phones]
            ]
        })

        let limit = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().replace('Z', '-07')

        let result = await db.select('status', {
            conditions: [
                ['user', '!=', req.user.id],
                // check if status is not expired 24 hours
                ['created_at', '>=', limit],
                ['user', 'in', acc.map((item) => item.id)]
            ]
        })

        var remove = [];
        for (let i = 0; i < result.length; i++) {
            let status = result[i]
            if (status.privacy == null || status.privacy === undefined) {
                continue;
            }
            if (status.privacy.type == 1) {
                if (status.privacy.exclude.indexOf(req.user.id) > -1) {
                    remove.push(i);
                }
            } else if (status.privacy.type == 2) {
                if (status.privacy.include.indexOf(req.user.id) == -1) {
                    remove.push(i);
                }
            }
        }
        for (let i = remove.length - 1; i >= 0; i--) {
            result.splice(remove[i], 1);
        }


        let ids = result.map((item) => item.id)
        let views = await db.select('status_view', {
            conditions: [
                ['status', 'in', ids],
                ['user', '=', req.user.id]
            ]
        })
        let likes = await db.select('status_like', {
            conditions: [
                ['status', 'in', ids],
                ['owner', '=', req.user.id]
            ]
        })
        let data = []

        for (let i = 0; i < result.length; i++) {
            let status = result[i]
            let view = views.filter((item) => item.status == status.id)
            let like = likes.filter((item) => item.status == status.id)
            status.viewed = view.length > 0
            status.im_liking = like.length > 0
            data.push(status)
        }

        res.status(200).json({
            status: '200',
            message: 'Success',
            data: data
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.getPublicStatus = async (req, res) => { }

exports.getFollowingStatus = async (req, res) => { }

exports.statusSeen = async (req, res) => {
    let payload = {
        user: req.user.id,
        status: req.params.id,
    }

    try {
        let result = await db.insert('status_view', payload, 'id')
        payload.id = result[0].id
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.updatePrivacy = async (req, res) => {
    let body = req.body
    console.log(body)
    let payload = {
        owner: req.user.id,
        type: body.type,
        include: body.include,
        exclude: body.exclude,
        updated_at: chat.now()
    }
    try {
        if (body.type !== undefined) {
            let result = await db.knex('status_privacy').insert(payload, 'id').onConflict(['owner']).merge()
            payload.id = result[0].id
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: payload
            })
        } else {
            let result = await db.select('status_privacy', {
                conditions: [
                    ['owner', '=', req.user.id]
                ],
                fields: ['*']
            })
            if (result.length) {
                res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: result[0]
                })
            } else {
                console.log('status privacy not found')
                res.status(200).json({
                    status: '200',
                    message: 'Not Found, new user again update in request body',
                    data: {}
                })
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.like = async (req, res) => {
    let { id } = req.params
    let user_id = req.user.id
    let payload = {
        owner: req.user.id,
        status: id,
    }
    try {
        let result = await db.insert('status_like', payload, 'id')
        payload.id = result[0].id
        try {
            let status = await db.select('status', {
                fields: ['user',],
                conditions: [
                    ['id', '=', id]
                ]
            })
            if (status[0].user != user_id) {
                notify(req, status[0].user, NotificationType.storyLike, {
                    sender: user_id,
                    status: id
                });
            }
        } catch (error) {
            console.log(error);
        }
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.unlike = async (req, res) => {
    let { id } = req.params
    let user_id = req.user.id
    try {
        await db.delete2('status_like', {
            conditions: [
                ['owner', '=', req.user.id],
                ['status', '=', id]
            ]
        })
        try {
            let status = await db.select('status', {
                fields: ['user',],
                conditions: [
                    ['id', '=', id]
                ]
            })
            if (status[0].user != user_id) {
                revokeNotify(status[0].user, NotificationType.storyLike, {
                    sender: user_id,
                    status: id
                });
            }
        } catch (e) { }
        res.status(200).json({
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

exports.likes = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const likes = await db.fun('get_story_like_list', {
        params: `${user_id},${id}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: likes
    });
}

exports.views = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const views = await db.fun('get_story_view_list', {
        params: `${user_id},${id}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: views
    });
}

exports.getSharaeableStatus = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        let result = await db.select('status', {
            fields: ['*'],
            conditions: [
                ['id', '=', id],
            ]
        });

        if (result.length == 0) {
            return res.status(404).json({
                status: '404',
                message: 'Status not found'
            });
        }

        let data = result[0];
        data.link = `${process.env.DOMAIN_URL}/status?q=${data.id}`;

        return res.send({
            status: '200',
            message: 'Success',
            data: data
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.delete = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        let result = await db.select('status', {
            fields: ['*'],
            conditions: [
                ['id', '=', id],
                ['user', '=', user_id],
            ]
        });

        if (result.length == 0) {
            return res.status(404).json({
                status: '404',
                message: 'Status not found'
            });
        }

        await db.delete2('status', {
            conditions: [
                ['id', '=', id],
                ['user', '=', user_id],
            ]
        });

        return res.send({
            status: '200',
            message: 'Success',
            data: {}
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}