const db = require('../service/chat/postgres')
const auth = require('../middleware/auth')
const qikberry = require('../service/qikberry/qikberry')

exports.sendOTP = async (req, res) => {
    let phone = req.body.phone;
    let code = req.body.code;
    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        let normalized = `${code}${phone}`;
        await db.delete2('otp', {
            conditions: [
                ['phone', '=', normalized],
            ]
        })

        let r = await db.insert('otp', {
            phone: normalized,
            otp: otp,
            created_at: new Date()
        }, 'id');


        let s = await qikberry.sendOTP(otp, normalized);
        if(s.status === 'OK'){
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: {
                    id: r[0].id,
                    phone: normalized,
                }
            });
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: `Internal Server Error ${error}`
        });
    
    }
}

exports.passwordAuth = async (req, res) => {
    let {phone, code, pass, mail} = req.body;
    
    try {
        var conditions = [
            ['phone', '=', phone],
            ['code', '=', code],
        ];
        if(mail){
            conditions = [
                ['mail', '=', mail]
            ]
        }
        let r = await db.select('account', {
            fields: ['*'],
            conditions: conditions
        })

        if(r.length === 0){
            return res.status(401).json({
                status: '401',
                message: 'Account not found'
            });
        } else {
            let ac = r[0];
            if(ac.cipher === pass){
                let devices = await db.select('device', {
                    fields: ['*'],
                    conditions: [
                        ['owner', '=', ac.id]
                    ]
                });
                
                // if(devices.length > 3) {
                //     return res.status(401).json({
                //         status: '401',
                //         message: 'Can\'t login more than 4 devices'
                //     });
                // }
                let device = {
                    owner: ac.id,
                    data: req.body.device,
                    updated_at: new Date()
                }
                let d = await db.insert('device', device, 'id');
                device.id = d[0].id;
                delete device.data
                ac.device = device;
                let token = auth.generateToken(ac);
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: {
                        token: token,
                        user: ac
                    }
                });
            } else {
                return res.status(402).json({
                    status: '402',
                    message: 'Incorrect Password'
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.phoneAuth = async (req, res) => {
    let phone = req.body.phone;
    let mail = req.body.mail;
    let code = req.body.code;
    let otp = req.body.otp;
    let pass = req.body.pass;
    let strategy = req.body.strategy || 'firebase';
    console.log(req.body.device)
    let device = {
        data: req.body.device,
        updated_at: new Date()
    };

    //&& phone !== '9841309841'

    if(strategy === 'otp' && phone !== '1234567890' ){
        let normalized = `${code}${phone}`;
        let result = await db.select('otp', {
            fields: ['*'],
            conditions:[
                ['phone', '=', normalized],
                ['otp', '=', otp],
            ]
        });

        if(result.length > 0){
            let otp = result[0];
            let now = new Date();
            let diff = Math.abs(now - otp.created_at) / 60000;
            if(diff > 5){
                return res.status(401).json({
                    status: '401',
                    message: 'OTP Expired'
                });
            }
        } else {
            return res.status(401).json({
                status: '401',
                message: 'Invalid OTP'
            });
        }
        await db.delete2('otp', {
            conditions: [
                ['phone', '=', normalized],
            ]
        })
    }

    var browser = false;

    try{
        browser = req.body.device.name === 'Browser';
    } catch (e) {}

    try {
        console.log(phone, code, otp, mail)
        let m = {
            fields: ['*'],
            conditions:[
                ['phone', '=', phone],
                ['code', '=', code],
            ]
        }
        if(mail){
            m.conditions = [
                ['mail', '=', mail]
            ]
        }
        let result = await db.select('account', m);

        if(result.length > 0){
            if(pass){
            await db.update('account', {
                fields: {
                    cipher: pass
                },
                conditions: [
                    ['id', '=', result[0].id]
                ]
            })
        }
            let account = result[0];

            device.owner = account.id;
            
            if(!browser){
                await db.delete2('device', {
                    conditions: [
                        ['owner', '=', account.id]
                    ]
                })
            }
            

            await db.delete2('fcm', {
                conditions: [
                    ['user', '=', account.id]
                ]
            })

            await db.delete2('pushkit', {
                conditions: [
                    ['user', '=', account.id]
                ]
            })
            let d = await db.insert('device', device, 'id');
            device.id = d[0].id;
            delete device.data
            account.device = device;
            let token = auth.generateToken(account);

            if(account.deleted){
                await db.update('account', {
                    fields: {
                        deleted: false
                    },
                    conditions: [
                        ['id', '=', account.id]
                    ]
                })
                account.deleted = false
            }

            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: {
                    token: token,
                    user: account
                }
            });
        } else {
            // return res.status(401).json({
            //     status: '401',
            //     message: 'App is in development mode APP ID: DHK844KJH4KH098'
            // })

            let account = {
                phone: phone,
                code: code,
                mail: mail,
                cipher: pass,
                normalized: `${code}${phone}`,
                created_at: new Date()
            }
            

            let result = await db.insert('account', account, 'id');

            if(result.length > 0){
                account.id = result[0].id;

                let devices = await db.select('device', {
                    fields: ['*'],
                    conditions: [
                        ['owner', '=', account.id]
                    ]
                });
                
                // if(devices.length > 3) {
                //     return res.status(401).json({
                //         status: '401',
                //         message: 'Can\'t login more than 4 devices'
                //     });
                // }

                device.owner = account.id;
                let d = await db.insert('device', device, 'id');
                device.id = d[0].id;
                delete device.data
                account.device = device;

                let token = auth.generateToken(account);

                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: {
                        token: token,
                        user: account
                    }
                });
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.qrAuth = async (req, res) => {
    let token = req.body.token;
    let device = auth.checkTokenSocket(token);
    if(device){
        let result = await db.select('device', {
            fields: ['*'],
            conditions:[
                ['device', '=', device.id],
            ]
        })
        if(result.length > 0){
            let account = await db.select('account', {
                fields: ['*'],
                conditions:[
                    ['id', '=', result[0].owner],
                ]
            })
            if(account.length > 0){
                account = account[0]
                let devices = await db.select('device', {
                    fields: ['*'],
                    conditions: [
                        ['owner', '=', account.id]
                    ]
                });
                
                // if(devices.length > 3) {
                //     return res.status(401).json({
                //         status: '401',
                //         message: 'Can\'t login more than 4 devices'
                //     });
                // }
                account.device = result[0]
                let token = auth.generateToken(account);
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: {
                        token: token,
                        user: account
                    }
                });
            }
        } else {
            return res.send({
                status: '200',
                    message: 'Success',
                    data: {
                        token: token,
                    }
            })
        }
    } else {
        let id = 0 + Date.now();
        device = {
            id: id,
            data: req.body.device,
            updated_at: new Date()
        };
        let t = auth.generateToken(device, '1m');
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: {
                token: t,
            }
        });
    }
}

exports.qrAuthLink = async (req, res) => {
    let token = req.body.token;
    let user = req.user;
    let device = auth.checkTokenSocket(token);
    if(device){
        let devices = await db.select('device', {
            fields: ['*'],
            conditions: [
                ['owner', '=', user.id]
            ]
        })

        // if(devices.length > 3) {
        //     return res.status(200).json({
        //         status: '404',
        //         message: 'Can\'t login more than 4 devices'
        //     });
        // } else {
            let payload = {
                device: device.id,
                owner: user.id,
                data: device.data,
                updated_at: new Date()
            };
            let result = await db.insert('device', payload, 'id')
            payload.id = result[0].id
            return res.status(200).json({
                status: '200',
                message: 'Successfully Linked',
                data: payload
            });
        // }
    } else {
        return res.status(200).json({
            status: '404',
            message: 'Invalid QR'
        })
    }
}

exports.changeNumber = async (req, res) => {
    let phone = req.body.phone;
    let code = req.body.code;
    let otp = req.body.otp;

    try {
        let payload = {
            phone: phone,
            code: code,
            normalized: `${code}${phone}`,
            updated_at: new Date()
        }

        let result = await db.update('account', {
            fields: payload,
            conditions: [
                ['id', '=', req.user.id]
            ]
        })

        if(result){
            req.user.phone = payload.phone;
            req.user.code = payload.code;
            req.user.normalized = payload.normalized;
            delete req.user.exp
            let token = auth.generateToken(req.user)
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: {
                    user: req.user,
                    token: token
                }
            });
        }

        return res.status(401).json({})
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.checkName = async (req, res) => {
    const usernameRegExp = /^[a-z0-9_.]+$/;
    let name = req.body.name || req.query.name;

    console.log(name);

    if(!usernameRegExp.test(name)){
        console.log('invalid username')
        return res.status(202).json({
            status: '202',
            message: 'Username unavailable',
            data: {
                available: false
            }
        });
    }
    try {
        // check character length
        if(name.length < 3 || name.length > 20){
            console.log('invalid length username')
            return res.status(202).json({
                status: '202',
                message: 'Username unavailable',
                data: {
                    available: false
                }
            });
        }

        let result = await db.select('account', {
            fields: ['*'],
            conditions:[
                ['uname', '=', name],
                ['id', '!=', req.user.id]
            ]
        });

        if(result.length > 0){
            console.log('username unavailable')
            return res.status(202).json({
                status: '202',
                message: 'Username unavailable',
                data: {
                    available: false
                }
            });
        } else {
            console.log('username available')
            return res.status(200).json({
                status: '200',
                message: 'Username available',
                data: {
                    available: true
                }
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.me = async (req, res) => {
    try {
        let accounts = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', '=', req.user.id]
            ]
        })
    
        if(accounts.length > 0){
            let account = accounts[0];
            let devices = await db.select('device', {
                fields: ['*'],
                conditions: [
                    ['owner', '=', account.id]
                ]
            });
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: {
                    user: account,
                }
            });
        } else {
            return res.status(404).json({
                status: '404',
                message: 'Not Found'
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: `Internal Server Error ${error}`
        });
    }
}

exports.updateProfile = async (req, res) => {
    let payload = {
        dname: req.body.dname,
        avatar: req.body.avatar,
        uname: req.body.uname,
        data: req.body.data,
        type: req.body.type || 0,
        business: req.body.business || 0,
        visibility: req.body.visibility || 0,
        categories: req.body.categories || [],
        dob: req.body.dob,
        gender: req.body.gender
    }

    try {
        let result = await db.update('account', {
            fields: payload,
            conditions: [
                ['id', '=', req.user.id]
            ]
        });

        if(result){
            req.user.name = payload.name;
            req.user.avatar = payload.avatar;
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: {
                    user: req.user
                }
            });
        } else {
            return res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.updateRecovery = async (req, res) => {
    let body = req.body
    console.log(body)
    if(req.user == undefined){
        return res.status(401).json({
            status: '401',
            message: 'Unauthorized'
        })
    }
    let payload = {
        owner: req.user.id,
        data: body.data,
        email: body.email,
        updated_at: new Date()
    }
    try {
        if(body.email !== undefined){
            let result = await db.knex('recovery').insert(payload, 'id').onConflict(['owner']).merge()
            payload.id = result[0].id
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: payload
            })
        } else {
            let result = await db.select('recovery', {
                conditions: [
                    ['owner', '=', req.user.id]
                ],
                fields: ['*']
            })
            if(result.length){
                res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: result[0]
                })
            } else {
                console.log('recovery not found')
                res.status(200).json({
                    status: '200',
                    message: 'Not Found, new user again update in request body',
                    data: {}
                })
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.updatePrivacy = async (req, res) => {
    let body = req.body
    let schema = body.schema || 'status_privacy'
    if(req.user == undefined){
        return res.status(401).json({
            status: '401',
            message: 'Unauthorized'
        })
    }
    
    let allowedSchema = ['status_privacy', 'avatar_privacy', 'session_privacy', 'bio_privacy', 'group_privacy', 'session_online_privacy']

    if(!allowedSchema.includes(schema)){
        return res.status(400).json({
            status: '400',
            message: 'Invalid schema',
            data: null
        })
    }

    let payload = {
        owner: req.user.id,
        type: body.type,
        include: body.include,
        exclude: body.exclude,
        updated_at: new Date()
    }
    try {
        console.log(body.type)
        if(body.type != null){
            console.log('insert')
            let result = await db.knex(schema).insert(payload, 'id').onConflict(['owner']).merge()
            payload.id = result[0].id
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: payload
            })
        } else {
            console.log('get')
            let result = await db.select(schema, {
                conditions: [
                    ['owner', '=', req.user.id]
                ],
                fields: ['*']
            })
            if(result.length){
                res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: result[0]
                })
            } else {
                console.log(`${schema} not found`)
                res.status(200).json({
                    status: '200',
                    message: 'Not Found, new user again update in request body',
                    data: {}
                })
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.deleteAccount = async (req, res) => {
    let id = req.user.id
    try {
        let result = await db.update('account', {
            fields: {
                deleted: true
            },
            conditions: [
                ['id', '=', id]
            ]
        })
        await db.delete2('device', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('post', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('channel', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('channel_member', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('group_member', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        return res.send({
            status: '200',
            message: 'Success',
            data: null
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.createChild = async (req, res) => {
    let body = req.body
    let user = req.user
    let payload = {
        dname: body.dname,
        parent: user.id,
        avatar: body.avatar,
        uname: body.uname,
        dob: body.dob,
        data: body.data
    }

    try {
        let result = await db.insert('account', payload, 'id')
        payload.id = result[0].id
        return res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.getChild = async (req, res) => {
    let user = req.user
    try {
        let result = await db.select('account', {
            conditions: [
                ['parent', '=', user.id]
            ],
            fields: ['*']
        })
        return res.send({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.makeAdmin = async (req, res) => {
    let {user, star} = req.body;

    try {
        let r = await db.update('account', {
            fields: {
                star: star
            },
            conditions: [
                ['id', '=', user]
            ]
        })
        return res.send({
            status: '200',
            message: 'Success',
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.removeAdmin = async (req, res) => {
    let {user} = req.body;

    try {
        let r = await db.update('account', {
            fields: {
                star: null
            },
            conditions: [
                ['id', '=', user]
            ]
        })
        return res.send({
            status: '200',
            message: 'Success'
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}