const db = require('../service/postgres.js');
const auth = require('../middleware/auth.js');

// async function formatData() {
//     let res = await db.select('device', {fields: ['*'], conditions: []});
//     for(let e in res){
//         console.log({
//             data: res[e].data,
//         });
//         db.update('device', {
//             fields:{
//                 data: {
//                     data: res[e].data,
//                 }
//             },
//             conditions: [
//                 ['id', '=', res[e].id]
//             ]
//         })
//     }
// }
// formatData();

exports.enroll = async (req, res) => {
    let { imei, serial, data} = req.body;

    let payload = {
        imei: imei,
        serial: serial,
        last_online: new Date(),
        data: data
    }

    try {
        let device = await db.select('device', {
            fields: ['*'],
            conditions: [
                ['imei', '=', imei]
            ]
        });

        if(device.length == 0) {
            let data = await await db.insert('device', payload, 'id');
            payload.id = data[0].id;
            let token = auth.generateToken(payload);
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: {
                    token: token,
                    device: payload
                }
            });
        } else {
            payload.id = device[0].id;
            let token = auth.generateToken(payload);
            await db.update('device', {
                fields: payload,
                conditions: [
                    ['id', '=', payload.id]
                ]
            });
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: {
                    token: token,
                    device: payload
                }
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getDevices = async (req, res) => {
    try {
        let devices = await db.select('device', {
            fields: ['*'],
            conditions: []
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: devices
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.mutateApp = async (req, res) => {
    let app = req.body;

    try {
        if(req.update) {
            await db.update('app', {
                fields: app,
                conditions: [
                    ['id', '=', app.id]
                ]
            });
        } else {
            const result = await db.insert('app', app, 'id');
            app.id = result[0].id;
        }
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: app
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.deleteApp = async (req, res) => {
    let app = req.body;

    try {
        await db.delete2('app', {
            conditions: [
                ['id', '=', app.id]
            ]
        });
        res.status(200).json({
            status: '200',
            message: 'Success'
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getApps = async (req, res) => {
    try {
        let apps = await db.select('app', {
            fields: ['*'],
            conditions: []
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: apps
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.syncApps = async (req, res) => {
    let apps = req.body;
    let device = req.user;
    
    if(!Array.isArray(apps)) {
        res.status(400).json({
            status: '400',
            message: 'Bad Request'
        });
        return;
    }

    try {
        for(let i = 0; i < apps.length; i++) {
            let d = apps[i];
            let app = {
                package: d.package,
                name: d.name,
                device: device.id,
                data: d.data
            }
            let data = await db.select('device_app', {
                fields: ['*'],
                conditions: [
                    ['package', '=', app.package],
                    ['device', '=', device.id]
                ]
            });
            if(data.length == 0) {
                await db.insert('device_app', app, 'id');
            } else {
                app.updated_at = new Date();
                await db.update('device_app', {
                    fields: app,
                    conditions: [
                        ['package', '=', app.package],
                        ['device', '=', device.id]
                    ]
                });
            }
        }
        res.status(200).json({
            status: '200',
            message: 'Success'
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }

}
exports.syncUsage = async (req, res) => {
    let usages = req.body;
    let device = req.user;

    if(!Array.isArray(usages)) {
        res.status(400).json({
            status: '400',
            message: 'Bad Request'
        });
        return;
    }

    try {
        for(let i = 0; i < usages.length; i++) {
            let d = usages[i];
            let data = await db.select('device_app', {
                fields: ['*'],
                conditions: [
                    ['package', '=', d.package],
                    ['device', '=', device.id]
                ]
            });
            if(data.length == 0) {
                continue;
            } else {
                let app = data[0];
                let usage = {
                    device: device.id,
                    app: app.id,
                    package: d.package,
                    duration: d.duration,
                    date: d.date
                }
                try {
                    await db.insert('app_usage', usage, 'id');
                } catch (e) {
                    usage.updated_at = new Date();
                    await db.update('app_usage', {
                        fields: usage,
                        conditions: [
                            ['package', '=', d.package],
                            ['device', '=', device.id],
                            ['date', '=', d.date]
                        ]
                    });
                }
                
            }
        }
        res.status(200).json({
            status: '200',
            message: 'Success'
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getUsage = async (req, res) => {
    let { device, date } = req.query;
    let user = req.user;

    if(!device || !date) {
        res.status(400).json({
            status: '400',
            message: 'Bad Request'
        });
        return;
    }

    try {
        let data = await db.fun('get_app_usage', {
            params: `'${date}', ${device}`
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: data
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getDeviceApps = async (req, res) => {
    let { device } = req.query;
    let user = req.user;

    if(!device) {
        res.status(400).json({
            status: '400',
            message: 'Bad Request'
        });
        return;
    }

    try {
        let data = await db.select('device_app', {
            fields: ['*'],
            conditions: [
                ['device', '=', device]
            ],
            orderBy: 'created_at',
            order: 'DESC'
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: data
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.updateDevice = async (req, res) => {
    let body = req.body;
    let device = {
        id: body.id,
        serial: body.serial,
        imei: body.imei,
        data: body.data
    };

    if(!device) {
        res.status(400).json({
            status: '400',
            message: 'Bad Request'
        });
        return;
    } else {
        try {
            device.updated_at = new Date();
            await db.update('device', {
                fields: device,
                conditions: [
                    ['id', '=', device.id]
                ]
            });
            res.status(200).json({
                status: '200',
                message: 'Success'
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            });
        }
    }
}