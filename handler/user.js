const db = require('../service/postgres.js');
const auth = require('../middleware/auth.js');


exports.login = async (req, res) => {
    const { login, password } = req.body;

    if (login && password) {
        const unames = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['phone', '=', login]
            ]
        });

        if (unames.length) {
            req.body.user = unames[0];
            return loginWithPassword(req, res)
        } else {
            emails = await db.select('account', {
                fields: ['*'],
                conditions: [
                    ['mail', '=', login]
                ]
            });

            if (emails.length) {
                req.body.user = emails[0];
                return loginWithPassword(req, res)
            }
        }

        return res.send({
            status: '404',
            message: 'User not found',
            data: null
        })
    } else {
        return res.send({
            status: '400',
            message: 'Bad Request (login or password is empty)',
            data: null
        })
    }
};

async function loginWithPassword (req, res) {
    const { user, password } = req.body;
    const type = req.params.type;

    let data = await db.select('key_chain', { fields: ['*'], conditions: [['owner', '=', user.id]] });

    if (data.length) {
        if (data[0].hash === password) {
            if(type === 'admin') {
                let admins = await db.select('admin', { fields: ['*'], conditions: [['uid', '=', user.id]] });
                if(admins.length) {
                    user.admin = admins[0];
                } else {
                    return res.send({
                        status: '403',
                        message: 'Not an admin',
                        data: null
                    })
                }
            }

            let token = auth.generateToken(user);
            user.token = token;
            console.log(`${user.mail} (${user.id}) Logged in as ${type}`);
            return res.send({
                status: '200',
                message: 'Logged in',
                data: user
            })
        } else {
            return res.send({
                status: '401',
                message: 'Incorrect password',
                data: null
            })
        }
    } else {
        return res.send({
            status: '402',
            message: 'Password not set',
            data: null
        })
    }
}

exports.loginWithPassword = loginWithPassword;

validateEmail = (email) => {
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}

validatePassword = (password) => {
    let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    return re.test(password);
}

exports.signup = async (req, res) => {
    const { fname, mail, password, lname, bot, bio} = req.body;

    if (fname && lname && mail && password) {
        if (!validateEmail(mail)) {
            return res.status(400).json({
                status: '400',
                message: 'Invalid email',
                data: null
            })
        }
        if (!validatePassword(password)) {
            return res.status(400).json({
                status: '400',
                message: 'Invalid password',
                data: null
            })
        }
        const emails = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['mail', '=', mail]
            ]
        });

        if (emails.length) {
            return res.status(409).json({
                status: '409',
                message: 'Email already taken',
                data: null
            })
        } else {
            let user = req.body;
            delete user.password;
            delete user.token;
            delete user.id;

            const data = await db.insert('account', {
                lname: lname,
                mail: mail,
                fname: fname,
                type: 0,
                data: {}
            }, 'id');

            if (data) {
                user.id = data[0].id;
                const pdata = await db.insert('key_chain', {
                    owner: data[0].id,
                    hash: password
                });

                if (pdata) {
                    let token = auth.generateToken(user);
                    user.token = token;
                    return res.status(200).json({
                        status: '200',
                        message: 'Registered',
                        data: user
                    })
                } else {
                    return res.status(500).json({
                        status: '500',
                        message: 'Internal Server Error (password not created)',
                        data: null
                    })
                }
            } else {
                return res.res.status(500).json({
                    status: '500',
                    message: 'Internal Server Error (user not created)',
                    data: null
                })
            }
        }
    
    } else {
        return res.status(400).json({
            status: '400',
            message: 'Bad Request (uname, mail or password is empty)',
            data: req.body
        })
    }
}