require('dotenv').config();
const db = require('../service/chat/postgres')
const {ModeratorRole, MeritScoreType, ModerationStatus} = require('../consts/enums.js')

exports.addModerator = async (req, res) => {
    let {user, star, role} = req.body;

    let payload = {
        user, star, role,
        owner: req.user.id
    }

    try {
        let r = await db.insert('mod', payload, 'id')

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.removeModerator = async (req, res) => {
    let {id} = req.body;

    try {
        let r = await db.delete2('mod', {
            conditions: [
                ['id', '=', id]
            ]
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.updateModerator = async (req, res) => {
    let {id, user, star, role} = req.body;

    let payload = {
        role
    }

    try {
        let r = await db.update('mod', payload, {
            conditions: [
                ['id', '=', id]
            ]
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getModerators = async (req, res) => {
    try {
        let r = await db.select('mod', {
            fields: ['*'],
            conditions: []
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.addMeritScore = async (req, res) => {
    let {user, score, type, star} = req.body;

    let payload = {
        user, score, type, star,
        owner: req.user.id
    }

    try {
        let r = await db.insert('merit', payload, 'id')

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.imModerator = async (req, res) => {
    try {
        let r = await db.select('mod', {
            fields: ['*'],
            conditions: [
                ['user', '=', req.user.id],
                ['star', '=', req.user.star]
            ]
        })
        if(r.length > 0){
            return res.send({
                status: '200',
                message: 'Success',
                data: r[0]
            })
        } else {
            return res.send({
                status: '404',
                message: 'Your are not a moderator'
            })
        }
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.myScores = async (req, res) => {
    try {
        let r = await db.select('merit', {
            fields: ['*'],
            conditions: [
                ['user', '=', req.user.id],
                ['star', '=', req.user.star]
            ]
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.moderatePost = async (req, res) => {
    let {id, mod, data} = req.body;

    try {
        let r = await db.update('post', {
            fields: {
                mod_status: mod,
                mod: req.user.id,
                data: data
            },
            conditions: [
                ['id', '=', id]
            ]
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.approvePost = async (req, res) => {
    let {id, data} = req.body;

    try {
        let r = await db.update('post', {
            fields: {
                mod_status: ModerationStatus.approved,
                data: data,
                mod: req.user.id
            },
            conditions: [
                ['id', '=', id]
            ]
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.declinePost = async (req, res) => {
    let {id, data} = req.body;

    try {
        let r = await db.update('post', {
            fields: {
                mod_status: ModerationStatus.declined,
                data: data,
                mod: req.user.id
            },
            conditions: [
                ['id', '=', id]
            ]
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.moveToPending = async (req, res) => {
    let {id, data} = req.body;

    try {
        let r = await db.update('post', {
            fields: {
                mod_status: ModerationStatus.pending,
                mod: req.user.id,
                data: data
            },
            conditions: [
                ['id', '=', id]
            ]
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getPosts = async (req, res) => {
    let {mod_status, limit, offset} = req.query;

    try {
        let r = await db.fun('get_moderation_posts', `${req.user.id}, ${limit}, ${offset}, ${mod_status}, ${req.user.star}`)

        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}