exports.message = async (token, data, notification) => {
    try {
        let tokens = [];
        if (Array.isArray(token)) {
            token = token.filter(function (el) {
                return el != null && el != undefined && el != '';
            });
            tokens = token;
        } else {
            tokens.push(token);
        }

        
        const payload = {
            data: data,
        };
        if (notification !== undefined && notification !== null) {
            payload.notification = notification;
        }
        console.log(data.collapseKey || 'None')
        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24,
            contentAvailable: true,
            mutableContent: true,
            collapseKey: data.collapseKey || 'None',
        };
        let result = await wAdmin.messaging().sendToDevice(token, payload, options);
        // let result = await wAdmin.messaging().sendEachForMulticast(
        //     {
        //         tokens: tokens,
        //         notification: notification,
        //         android: {
        //             priority: 'high',
        //             collapseKey: data.collapseKey || 'None',
        //             data: data,
        //             ttl: 60 * 60 * 24 * 1000,                           
        //             restrictedPackageName: 'com.timesmed.wego',
        //         },
        //         data: data,
        //         apns: {
        //             payload: {
        //                 aps: {
        //                     contentAvailable: true,
        //                     mutableContent: true,
        //                     threadId: data.collapseKey || 'None',
        //                     category: data.collapseKey || 'None'
        //                 },
                        
        //             }
        //         }
        //     }
        // );
        console.log(result);
        return result;
    } catch (e) {
        console.log(e)
        return false;
    }
}