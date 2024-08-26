//write a middleware function that checks if the token is valid
//if it is valid, then call next() to continue the request
//if it is not valid, then return a 401 status code and a message
//that says "Unauthorized"

const jwt = require('jsonwebtoken');
const db = require('../service/postgres.js')
require('dotenv').config();

exports.generateToken = (payload, expiresIn = '365d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiresIn || '365d'});
}

exports.checkToken = (req, res, next) => {
    try {
        // const key = req.headers['x-api-key'];
        // const flavor = req.headers['x-flavour'];
        // console.log(key)
        // if (flavor != 'dev') {
        //     if (key != process.env.X_API_KEY) {
        //         return res.status(401).json({
        //             status: '401',
        //             message: 'Unauthorized'
        //         });
        //     }
        // }
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // let device = req.user.device

        // console.log('device', decoded)

        next();

        // if(device){
        //     let id = device.id;
        //     let d = {
        //         updated_at: new Date()
        //     }
        //     db.knex('device').where('id', id).update(d, 'id').then((d) => {
        //         console.log('device updated', d)
        //         if(d.length > 0){
        //             next();
        //         } else {
        //             console.log('device removed')
        //             return res.status(401).json({
        //                 status: '401',
        //                 message: 'Unauthorized device, Device removed from account'
        //             })
        //         }
                
        //     })
        // } else {
        //     return res.status(401).json({
        //         status: '401',
        //         message: 'Unauthorized device'
        //     })
        // }
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            status: '401',
            message: 'Unauthorized'
        });
    }
}

exports.checkTokenSocket = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return false;
    }
}


exports.checkAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.admin == undefined) {
            return res.status(401).json({
                status: '401',
                message: 'Unauthorized'
            });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: '401',
            message: 'Unauthorized'
        });
    }
}