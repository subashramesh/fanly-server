exports.message = async (token, data, notification) => {
    try {
        let tokens = Array.isArray(token) ? token.filter(el => el) : [token];

        var android;
        if (notification) {
            if (notification.android) {
                android = notification.android;
                delete notification.android;
            }
        }

        const payload = {
            data: data,
            ...(notification && { notification: notification }),
        };

        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24,
            contentAvailable: true,
            mutableContent: true,
            collapseKey: data.collapseKey || 'None',
        };

        const message = {
            tokens: tokens,
            ...payload,
        };

        if (android) {
            message.android = android
        }

        // console.log('message', message)
        // console.log('options', options)

        const result = await wAdmin.messaging().sendEachForMulticast({ ...message, ...options });

        result.responses.forEach((res, i) => {
            if (res.error) {
                // console.log(`Failure sending notification to token at index ${i}: `, res.error);
            }
        });

        return result;
    } catch (e) {
        console.log(e);
        return false;
    }
};