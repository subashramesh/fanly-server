const db = require('../service/chat/postgres')

exports.addPlace = async (req, res) => {
    let { id, place_id, name, data, owner } = req.body;

    try {
        if (id) {
            let r = await db.update('places', {
                fields: {
                    place_id, name, data, owner, updated_at: new Date()
                },
                conditions: [
                    ['id', '=', id]
                ]
            });
            return res.send({
                status: '200',
                message: 'Success',
                data: r
            });
        } else {
            let r = await db.insert('places', {
                place_id, name, data, owner, created_at: new Date(), updated_at: new Date()
            }, 'id');

            return res.send({
                status: '200',
                message: 'Success',
                data: {
                    id: r[0].id, place_id, name, data, owner
                }
            });
        }
    } catch (e) {
        let r = await db.select('places', {
            fields: ['*'],
            conditions: [
                ['place_id', '=', place_id]
            ]
        });
        if (r.length > 0) {
            return res.send({
                status: '200',
                message: 'Success',
                data: r[0]
            });
        }

        console.log(e);
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
};

exports.getPlaces = async (req, res) => {
    try {
        let r = await db.select('places', {
            fields: ['*'],
            conditions: [],
            orderBy: 'id',
            order: 'asc'
        });
        return res.send({
            status: '200',
            message: 'Success',
            data: r
        });
    } catch (e) {
        console.log(e);
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
};

exports.getPlace = async (req, res) => {
    let { id } = req.params;
    try {
        let r = await db.select('places', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        });
        if (r.length == 0) {
            return res.status(404).send({
                status: '404',
                message: 'Not Found'
            });
        } else {
            return res.send({
                status: '200',
                message: 'Success',
                data: r[0]
            });
        }
    } catch (e) {
        console.log(e);
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
};