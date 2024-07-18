const db = require('../service/chat/postgres')
const token = require('../middleware/auth')
const socket = require('./chat_socket.js')

exports.get = async (req, res) => {
    let user = req.user.id;

    try{
        let devices = await db.select('device', {
            fields: ['*'],
            conditions: [
                ['owner', '=', user]
            ]
        });
        for(let e of devices){
            if(e.id == req.user.device.id){
                e.current = true;
            }
        }

        res.send({
            status: '200',
            message: 'Devices fetched successfully',
            data: devices
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.remove = async (req, res) => {
    let id = req.params.id;

    try{
        let result = await db.delete2('device', {
            conditions: [
                ['id', '=', id],
                ['owner', '=', req.user.id]
            ]
        });
        res.send({
            status: '200',
            message: 'Device removed successfully',
            data: result
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}