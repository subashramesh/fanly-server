const db = require('../service/postgres.js');

exports.status = async (req, res) => {
    let owner = req.user.id;
    try{
        let v = await db.select('verification', {
            fields: ['*'],
            conditions: [
                ['owner', '=', owner]
            ]
        })
        if(v.length){
            return res.send({
                status: '200',
                message: 'Success',
                data: v[0]
            })
        } else {
            return res.send({
                status: '404',
                message: 'Not Found',
                data: null
            })
        }
    } catch(e){
        console.log(e);
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

exports.request = async (req, res) => {
    let {data} = req.body;
    let owner = req.user.id;
    let payload = {
        owner,
        data,
        status: 0,
        updated_at: new Date()
    }

    try {
        let result = await db.insert('verification', payload, 'id');
        payload.id = result[0].id

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}