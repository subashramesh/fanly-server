require('dotenv').config();
const db = require('../service/chat/postgres')
const socket = require('./chat_socket.js')

exports.create = async (req, res) => {
    let body = req.body;

    let statuses = body.statuses || []
    let id = body.id
    statuses = statuses.filter((e) => e.user == req.user.id)

    let payload = {
        owner: req.user.id,
        data: body.data,
        updated_at: new Date()
    }

    if(statuses.length){
        payload.statuses = statuses.map((e) => e.id)
    } else {
        return res.status(400).send({
            status: '400',
            message: 'Bad Request'
        })
    }
    if(body.id){
        payload.id = body.id
        let result = await db.select('highlight', {
            fields: ['*'],
            conditions: [
                ['owner', '=', req.user.id],
                ['id', '=', body.id]
            ]
        })

        if(result.length){
            // let u = await db.update('highlight', payload, {
            //     conditions: [
            //         ['id', '=', body.id],
            //         ['owner', '=', req.user.id]
            //     ]
            // })
            // return res.status(200).send({
            //     status: '200',
            //     message: 'Success',
            //     data: payload
            // })
            // update
        } else {
            return res.status(403).send({
                status: '403',
                message: 'Forbidden'
            })
        }
    }

    try {
        let result = await db.knex('highlight').insert(payload, 'id').onConflict(['id']).merge()
        payload.id = result[0].id

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.get = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await db.select('highlight', {
            fields: ['*'],
            conditions: [
                ['owner', '=', id]
            ],
            orderBy: 'created_at',
            order: 'asc'
        });

        let statusIds = result.map((e) => e.statuses).flat()
        let likes = await db.select('status_like', {
            conditions: [
                ['status', 'in', statusIds],
                ['owner', '=', req.user.id]
            ]
        })
        let re = await db.select('status', {
            fields: ['*'],
            conditions: [
                ['id', 'in', statusIds]
            ]
        })
        let statuses = []
        for (let i = 0; i < re.length; i++) {
            let status = re[i]
            let like = likes.filter((item) => item.status == status.id)
            status.im_liking = like.length > 0
            statuses.push(status)
        }


        for(let i in result){
            result[i].statuses = statuses.filter((e) => result[i].statuses.includes(e.id))
        }

        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
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
    let id = req.params.id;

    try {
        let result = await db.delete2('highlight', {
            conditions: [
                ['id', '=', id],
                ['owner', '=', req.user.id]
            ]
        });

        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: null
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getStatusArchive = async (req, res) => {
    try{
         let result = await db.select('status', {
            fields: ['*'],
            conditions: [
                ['user', '=', req.user.id]
            ]
        })
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getShareableHighlight = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await db.select('highlight', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        });

        if (result.length == 0) {
            return res.status(404).json({
                status: '404',
                message: 'Highlight not found'
            });
        }

        let data = result[0];
        data.link = `${process.env.DOMAIN_URL}/highlight?q=${data.id}`;

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