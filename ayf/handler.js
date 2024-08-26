const db = require('../service/chat/postgres')
const firebase = require('firebase-admin')
const service = require('./service.json')

const app = firebase.initializeApp({
    credential: firebase.credential.cert(service),
}, 'ayf')
exports.call = async function (req, res) {
    let user = req.body.user

    let table = 'ayf_fcm'

    try{
        let result = await db.select(table, {
            fields: ['token'],
            conditions: [
                ['user', '=', user]
            ]
        })
        let tokens = result.map((e) => {
            return e.token
        })

        let notification = {
            'title': 'Incoming Call',
            'body': 'You have an incoming call',
            android_channel_id: 'channelId100',
            sound: 'ring1.mp3',
        }
        let data = {
            'type': 'call',
            'user': `${user}`
        }

        const payload = {
            data: data
        };
        if (notification !== undefined && notification !== null) {
            payload.notification = notification;
        }
        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24,
            contentAvailable: true,
        };
        let message = await firebase.messaging(app).sendToDevice(tokens, payload, options);

        console.log('Successfully sent message: ', message);

        return res.send({
            status: '200',
            message: 'Call sent',
            data: {
                tokens: tokens
            }
        })

    } catch(e){
        console.log(e)
        return res.send({
            status: '500',
            message: `Internal Server Error ${e}`
        })
    }
}

exports.updateToken = async function (req, res) {
    let user = req.body.user
    let token = req.body.token

    let table = 'ayf_fcm'

    let data = {
        token: token,
        user: user
    }

    try{
        let result = await db.insert(table, data, 'id')
        return res.send({
            status: '200',
            message: 'Token updated',
            data: {
                id: result[0]['id'],
                token: token,
                user: user
            }
        })
    } catch(e){
        console.log(e)
        return res.send({
            status: '500',
            message: `Token already exists / Internal Server Error ${e}`
        })
    }
    


}