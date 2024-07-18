global.admin = require('firebase-admin')
global.wAdmin = require('firebase-admin')

const a = require('firebase-admin')
// a.messaging().sendEachForMulticast(
//     {
//         tokens: ['a', 'b', 'c'],
//         notification: {
//             title: 'title',
//             body: 'body'
//         },
//         android: {
//             priority: 'high',
//             collapseKey: 'key',
//             data: {
//                 key: 'value'
//             },
//             ttl: 60 * 60 * 24 * 1000,
//             restrictedPackageName: 'com.timesmed.wego',
//         },
//         data: {
//             key: 'value'
//         },
//         apns: {
//             payload: {
//                 aps: {
//                     contentAvailable: true,
//                     mutableContent: true,
//                     threadId: 'threadId',
//                     category: 'category'
//                 }
//             }
//         },
        
//     }
// );


const serviceAccount = require('./w_service.json')
const wServiceAccount = require('./w_service.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})
wAdmin.initializeApp({
    credential: wAdmin.credential.cert(wServiceAccount)
}, 'wego')
