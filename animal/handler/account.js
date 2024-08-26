const db = require('../service/postgres.js')
const { generateToken } = require('../middleware/auth.js')
require('dotenv').config();

exports.login = async (req, res) => {
    let body = req.body
    let login = body.login
    let password = body.password

    try {
        let result = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['email', '=', login],
                ['password', '=', password]
            ]
        })
        if(result.length > 0){
            let account = result[0]
            let token =  generateToken(account)
                let data = {
                    token: token,
                    account: account
                }
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    data: data
                })
        } else {
            return res.status(401).json({
                status: '401',
                message: 'Unauthorized, Please check your email or password'
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}