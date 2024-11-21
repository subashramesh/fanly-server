const db = require('../service/chat/postgres')

exports.unSync = async (req, res) => {
    let data = req.body.data;
    try {
        return res.send({
            status: '200',
            message: 'Success',
            data: []
        })
        await db.delete2('contact', {
            conditions:[
                ['user', '=', `${req.user.id}`],
                ['phone', 'in', data],
            ]
        });

        // try{
        //     let accounts = await db.select('account', {
        //         fields: ['*'],
        //         conditions:[
        //             ['normalized', 'in', data],
        //         ],
        //         orWhere: [
        //             ['phone', 'in', data],
        //         ]
        //     });

        //     let ids = [];
        //     accounts.map((item) => {
        //         ids.push(item.id);
        //     });

        //     await db.delete2('follow', {
        //         conditions:[
        //             ['owner', '=', `${req.user.id}`],
        //             ['user', 'in', ids],
        //         ]
        //     });
        // } catch (error) {
        //     console.log(error)
        // }

        return res.send({
            status: '200',
            message: 'Success',
            data: []
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: `Internal Server Error ${error}`
        })
    }
}

exports.sync = async (req, res) => {
    let data = req.body.data;

    try {
        let phones = [];
        let payload = data.map((item) => {
            phones.push(item.normalized);
            return {
                'phone': item.normalized,
                'name': item.name,
                'user': `${req.user.id}`,
            }})
            .filter((item, index, self) =>
                index === self.findIndex((t) => (
                    t.phone === item.phone
                ))
            );
        try {
            let result = await db.knex('contact').insert(payload).onConflict(['phone', 'user']).merge();
        } catch (error) {
            console.log(error)
        }

        let result = await db.select('account', {
            fields: ['*'],
            conditions:[
                ['normalized', 'in', phones],
                ['uname', '!=', '']
            ],
            orWhere: [
                ['phone', 'in', phones],
            ]
        });

        // try {
        //     let follow = [];
        //     result.map((item) => {
        //         follow.push({
        //             'owner': `${req.user.id}`,
        //             'user': item.id,
        //             'updated_at': new Date(),
        //             'type': 1
        //         })
        //     });
        //     let result2 = await db.knex('follow').insert(follow).onConflict(['owner', 'user']).merge();
        //     console.log('followed contacts')
        // } catch (error) {
        //     console.log(error)
        // }

        let r = []
        for(let i = 0; i < result.length; i++){
            let item = result[i];
            console.log(item)
            if(item.data){
                item.data = {
                    avatar: item.data.avatar,
                }
            }
            let index = phones.indexOf(item.normalized) > -1 ? phones.indexOf(item.normalized) : phones.indexOf(item.phone);
            let d = data[index];
            d.user = item;
            r.push(d);
        }

        console.log(r)
        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.getContacts = async (req, res) => {
    try {
        let result = await db.select('contact', {
            fields: ['*'],
            conditions:[
                ['user', '=', `${req.user.id}`],
            ]
        });
        let phones = [];
        result.map((item) => {
            phones.push(item.phone);
        })
        // remove duplicates

        let result2 = await db.select('account', {
            fields: ['*'],
            conditions:[
                ['normalized', 'in', phones],
                ['uname', '!=', '']
            ],
            orWhere: [
                ['phone', 'in', phones],
            ]
        });

        let r = []

        for(let i = 0; i < result2.length; i++){
            let item = result2[i];
            let index = phones.indexOf(item.normalized) > -1 ? phones.indexOf(item.normalized) : phones.indexOf(item.phone);
            let d = result[index];
            d.user = item;
            r.push(d);
        }
        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}