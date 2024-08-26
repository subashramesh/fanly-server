const db = require('../service/chat/postgres')

exports.search = async (req, res) => {
    let type = req.params.type;
    let query = req.query.q;

    var result
    try {

        switch (type) {
            case 'user':
                let acc = await db.select('account', {
                    fields: ['*'],
                    conditions: [
                        ['dname', 'ilike', `%${query}%`]
                    ],
                    orWhere: [
                        ['uname', 'ilike', `%${query}%`]
                    ]
                });
                result = [];
                for (let i = 0; i < acc.length; i++) {
                    let id = acc[i].id;
                    let r = await db.fun('get_user',{
                        params: `${req.user.id},${id}`
                    });
                    if (r.length > 0) {
                        let d = r[0]['get_user']
                        if(d){
                            result.push(d);
                        }
                       
                    }
                }
                break;
            case 'room':
                result = await db.select('room', {
                    fields: ['id', 'name', 'description'],
                    conditions: [
                        ['name', 'ilike', `%${query}%`]
                    ]
                });
                break;
            default:
                return res.send({
                    status: '400',
                    message: 'Bad Request'
                });
        }

        return res.send({
            status: '200',
            message: 'Success',
            data: result
        });
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: `Internal Server Error ${e}`
        });   
    }
}