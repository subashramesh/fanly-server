const db = require('../service/chat/postgres')
const socket = require('./chat_socket.js')
const chat = require('./chat.js')
const privacy = require('./privacy.js')

exports.eject = async (req, res) => {
    try {
        let device = req.user.device;
        let id = device.id;
        await db.delete2('pushkit', {
                    conditions: [
                        ['user', '=', req.user.id]
                    ]
                })
        let result = await db.delete2('device', {
            conditions: [
                ['id', '=', id]
            ]
        });
    } catch (error) {
        console.log(error)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }

    res.send({
        status: '200',
        message: 'Success',
        data: {
            id: req.user.id,
            ejected: true
        }
    })
}

exports.get = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await db.select('session', {
            fields: ['*'],
            conditions: [
                ['owner', '=', id]
            ]
        });

        if (result.length > 0) {
            let rr = await db.select('privacy_view_n', {
                fields: ['*'],
                conditions: [
                    ['owner', '=', id]
                ]
            })
            let shutters = privacy.converge(rr, req.user.id);

            let session = result[0];
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: session,
                secondary: shutters
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

exports.all = async (req, res) => {
    let ids = req.body;
    try {
        ids = ids.filter(function (el) {
            return el != null && el != undefined && el != '' && el != 'null';
        });

        let result = await db.select('session', {
            fields: ['*'],
            conditions: [
                ['owner', 'in', ids]
            ]
        });

        if (result.length > 0) {
            let rr = await db.select('privacy_view_n', {
                fields: ['*'],
                conditions: [
                    ['owner', 'in', ids]
                ]
            })
            let shutters = privacy.converge(rr, req.user.id);

            let session = result;
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: session,
                secondary: shutters
            });
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            });
        }
    } catch(e){
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.update = async (req, res) => {
    let body = req.body;

    let payload = {
        owner: req.user.id,
        data: body.data,
        updated_at: new Date()
    }

    try {
        let result = await db.knex('session').insert(payload, 'id').onConflict(['owner']).merge()
        payload.id = result[0].id

        watchers(req, {
            send: (data) => {
                // console.log('send', data)
                socket.send(data.data, 'session', payload)
            }
        })

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (error) {
        console.log(error)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }

}

exports.keynote = async (req, res) => {
    let body = req.body;

    let payload = {
        box: body.box,
        data: body.data,
        updated_at: new Date()
    }

    try {
        let result = await db.knex('keynote').insert(payload, 'id').onConflict(['box']).merge()
        payload.id = result[0].id
        let l = body.box.split('-');

        if (l.includes('g')) {
            let receivers = await chat.getReceivers({group: l[1]})
            socket.send(receivers, 'keynote', payload)
        } else {
            socket.send(l, 'keynote', payload)
        }

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (error) {
        console.log(error)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.watchers = watchers
async function watchers(req, res){
    // let c = await db.select('contact', {
    //     fields: ['*'],
    //     conditions: [
    //         ['user', '=', req.user.id]
    //     ]
    // })
    // let p = c.map((e) => e.phone)
    
    let acc = await db.select('account', {
        fields: ['*'],
        conditions: []
        // conditions: [
        //     ['normalized', 'in', p]
        // ]
    })
    var result = acc.map((e) => e.id)
    //remove all own ids
    result = result.filter((e) => e != req.user.id)
    return res.send(
        {
            status: '200',
            message: 'Success',
            data: result
        }
    )
}

exports.counter = async (req, res) => {
    try {
        let cons = [
            ['owner', '=', req.user.id],
            ['seen', 'is', null],
        ]

        let star = req.user.star;

        if (star) {
            cons.push(['star', '=', star])
        }

        let act = await db.count('activity', {
            conditions: cons
        })
        // console.log(act)
        let data = {}
        data.activity = +act[0].count
        res.send({
            status: '200',
            message: 'Success',
            data: data
        })
    } catch (error) {
        console.log(error)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });  
    }
}