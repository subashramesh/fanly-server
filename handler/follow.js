require('dotenv').config();
const db = require('../service/chat/postgres.js');
const supa = require('../service/supabase/postgres.js');
const notification = require('./notification.js');
const { NotificationType, InteractionType, AccountVisibility } = require('../consts/enums.js');
const socket = require('./chat_socket.js')

exports.follow = async (req, res) => {
    let user = req.params.id
    let owner = req.user.id
    let payload = {
        user: user,
        owner: owner
    }
    try {
        let uu = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', '=', user]
            ]
        })
        if (uu.length > 0) {
            let account = uu[0]
            if (account.visibility == AccountVisibility.private) {
                let result = await db.insert('follow_request', payload, 'id');
                if (result.length > 0) {
                    payload.id = result[0]
                    payload.status = 0
                    await notification.revokeNotify(user, NotificationType.followRequest, {
                        sender: owner
                    })
                    notification.notify(req, user, NotificationType.followRequest, {
                        sender: owner
                    })
                    res.status(200).send({
                        message: 'Follow request sent',
                        status: '200',
                        data: payload
                    })
                }
            } else {
                let result = await db.insert('follow', payload, 'id');
                if (result.length > 0) {
                    payload.id = result[0]
                    payload.status = 1
                    notification.notify(req, user, NotificationType.follow, {
                        sender: owner
                    })
                    res.status(200).send({
                        message: 'Followed',
                        status: '200',
                        data: payload
                    })
                }
            }
        } else {
            return res.status(404).send({
                message: 'User not found',
                status: '404'
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.subscribe = async (req, res) => {
    let user = req.params.id
    let owner = req.user.id
    let payload = {
        user: user,
        owner: owner
    }
    try {
        let uu = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', '=', user]
            ]
        })
        if (uu.length > 0) {
            let account = uu[0]
            
            let result = await db.insert('subscribe', payload, 'id');

            if (result.length > 0) {
                payload.id = result[0]
                payload.status = 1
                
                res.status(200).send({
                    message: 'Subscribed',
                    status: '200',
                    data: payload})
            }

        } else {
            return res.status(404).send({
                message: 'User not found',
                status: '404'
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.unsubscribe = async (req, res) => {
    let user = req.params.id
    let owner = req.user.id
    try {
        let result = await db.delete2('subscribe', {
            conditions:[
                ['user', '=', user],
                ['owner', '=', owner]
            ]
        })
        res.status(200).send({
            message: 'Unsubscribed',
            status: '200'
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.unfollow = async (req, res) => {
    let user = req.params.id
    let owner = req.user.id
    try {
        let result = await db.delete2('follow', {
            conditions:[
                ['user', '=', user],
                ['owner', '=', owner]
            ]
        })
        await db.delete2('follow_request', {
            conditions:[
                ['user', '=', user],
                ['owner', '=', owner]
            ]
        })
        notification.revokeNotify(user, NotificationType.follow, {
            sender: owner
        })
        notification.revokeNotify(user, NotificationType.followRequest, {
            sender: owner
        })
        res.status(200).send({
            message: 'Unfollowed',
            status: '200'
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.accept = async (req, res) => {
    let id = req.params.id
    try {
        let rr = await db.select('follow_request', {
            fields: ['*'],
            conditions: [
                ['owner', '=', id],
                ['user', '=', req.user.id]
            ]
        })
        if (rr.length > 0) {
            let request = rr[0]
            let payload = {
                user: request.user,
                owner: request.owner
            }
            let result = await db.insert('follow', payload, 'id');
            if (result.length > 0) {
                payload.id = result[0]
                payload.status = 1
                await db.delete2('follow_request', {
                    conditions:[
                        ['id', '=', request.id]
                    ]
                })
                notification.notify(req, request.owner, NotificationType.followAccepted, {
                    sender: request.user
                })
                notification.notify(req, request.user, NotificationType.follow, {
                    sender: request.owner
                })
                notification.revokeNotify(request.user, NotificationType.followRequest, {
                    sender: request.owner
                })
                res.status(200).send({
                    message: 'Follow Accepted',
                    status: '200',
                    data: payload
                })
            }
        } else {
            return res.status(404).send({
                message: 'Request not found',
                status: '404'
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.reject = async (req, res) => {
    let id = req.params.id
    try {
        let rr = await db.select('follow_request', {
            fields: ['*'],
            conditions: [
                ['owner', '=', id],
                ['user', '=', req.user.id]
            ]
        })
        if (rr.length > 0) {
            let request = rr[0]
            await db.delete2('follow_request', {
                conditions:[
                    ['owner', '=', id],
                    ['user', '=', req.user.id]
                ]
            })
            notification.revokeNotify(request.user, NotificationType.followRequest, {
                sender: request.owner
            })
            res.status(200).send({
                message: 'Follow Rejected',
                status: '200'
            })
        } else {
            return res.status(404).send({
                message: 'Request not found',
                status: '404'
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.remove = async (req, res) => {
    let user = req.params.id
    let owner = req.user.id
    try {
        let result = await db.delete2('follow', {
            conditions:[
                ['owner', '=', user],
                ['user', '=', owner]
            ]
        })
        if (result) {
            res.status(200).send({
                message: 'Removed',
                status: '200'
            })
        } else {
            res.status(404).send({
                message: 'Not following',
                status: '404'
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.followers = async (req, res) => {
    let id = req.params.id
    try {
        let followers = await db.fun('get_followers', {
            params: `${req.user.id}, ${id}`
        })
        res.status(200).send({
            message: 'Followers fetched',
            status: '200',
            data: followers
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.followings = async (req, res) => {
    let id = req.params.id
    try {
        let followings = await db.fun('get_followings', {
            params: `${req.user.id}, ${id}`
        })
        res.status(200).send({
            message: 'Followings fetched',
            status: '200',
            data: followings
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.mutuals = async (req, res) => {
    let id = req.params.id
    try {
        let mutuals = await db.fun('get_mutuals', {
            params: `${req.user.id}, ${id}`
        })
        res.status(200).send({
            message: 'Mutuals fetched',
            status: '200',
            data: mutuals
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.messageRequest = async (req, res) => {
    let user = req.params.id
    let owner = req.user.id
    let payload = {
        user: user,
        owner: owner,
        state: 0
    }
    try {
        let uu = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', '=', user]
            ]
        })
        if (uu.length > 0) {
            let r = await supa.knex('message_request').insert(payload, 'id').onConflict(['user', 'owner']).merge()
            payload.id = r[0].id
            res.send({
                status: '200',
                message: 'Success',
                data: payload
            })
        } else {
            return res.status(404).send({
                message: 'User not found',
                status: '404'
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.acceptMessageRequest = async (req, res) => {
    let id = req.params.id
    try {
        let rr = await supa.select('message_request', {
            fields: ['*'],
            conditions: [
                ['owner', '=', id],
                ['user', '=', req.user.id]
            ]
        })
        if (rr.length > 0) {
            let request = rr[0]
            let payload = {
                user: request.user,
                owner: request.owner,
                state: 1
            }
            await supa.knex('message_request').insert(payload, 'id').onConflict(['user', 'owner']).merge()
            let payload1 = {
                owner: request.user,
                user: request.owner,
                state: 1
            }
            await supa.knex('message_request').insert(payload1, 'id').onConflict(['user', 'owner']).merge()
        } 
        
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}

exports.rejectMessageRequest = async (req, res) => {
    let id = req.params.id
    try {
        let rr = await supa.select('message_request', {
            fields: ['*'],
            conditions: [
                ['owner', '=', id],
                ['user', '=', req.user.id]
            ]
        })
        if (rr.length > 0) {
            let request = rr[0]
            await supa.delete2('message_request', {
                conditions:[
                    ['id', '=', request.id]
                ]
            })
            res.send({
                status: '200',
                message: 'Success'
            })
        } else {
            return res.status(404).send({
                message: 'Request not found',
                status: '404'
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: `Internal server error ${e}`,
            status: '500'
        })
    }
}