const db = require('../service/chat/postgres')

exports.business = async (req, res) => {
    try {
        let result = await db.select('business', {
            fields: ['*'],
            conditions:[],
        });
    
        return res.send({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}