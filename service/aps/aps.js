const apn = require('apn');
const path = require('path');


const apnProvider = new apn.Provider({
    token: {
        key: path.join(__dirname, 'AuthKey.p8'),
        keyId: '4LAG3UBY7Q',
        teamId: 'J2RBU3SJS6'
    },
    production: true
});

exports.sendVoip = async (deviceToken, payload) => {
    const notification = new apn.Notification();
    notification.topic = 'com.sk.fanly.voip';
    notification.payload = payload;
    notification.priority = 5;
    notification.expiry = 0;
    

    notification.pushType = 'voip';
    
    let aps = {
        'content-available': 1,
        'apns-expiration': 0,
        'mutable-content': 1,
        'apns-priority': 5
    }

    notification.aps = aps

    notification.alert = {
        title: 'Fanly',
        body: 'Incoming call'
    };
    notification.rawPayload = payload


    apnProvider.send(notification, deviceToken).then((response) => {
        console.log('PushKit notification sent:', response);
        try{
            response.failed.forEach((failed) => {
                console.log(failed);
                console.log(failed.response?.reason);
            })
        } catch(e) {
            console.log(e);
        }
    }).catch((error) => {
        console.error('Error sending PushKit notification:', error);
    });
}