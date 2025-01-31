require('dotenv').config();
const db = require('../service/chat/postgres')

exports.addStar = async (req, res) => {
    let { id, name, data, language, df, children} = req.body;


    try {
        if (id) {
            let r = await db.update('star ', {
                fields: {
                    name, data, language, df, children
                },
                conditions: [
                    ['id', '=', id]
                ]
            })
            return res.send({
                status: '200',
                message: 'Success',
                data: r
            })
        } else {
            let r = await db.insert('star', {
                name, data, language
            })

            return res.send({
                status: '200',
                message: 'Success',
                data: r
            })
        }
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getStars = async (req, res) => {
    try {
        let r = await db.select('star', {
            fields: ['*'],
            conditions: [],
            orderBy: 'id',
            order: 'asc'
        })
        let l = await db.select('language', {
            fields: ['*'],
            conditions: []
        })

        let j = await db.select('main_category', {
            fields: ['*'],
            conditions: []
        })
        // add all stars to language matching languange and id
        l = l.map((v) => {
            v.stars = r.filter((s) => s.language == v.id)
            return v
        })
        return res.send({
            status: '200',
            message: 'Success',
            data: l,
            secondary: j
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getStarList = async (req, res) => {
    try {
        let r = await db.select('star', {
            fields: ['id', 'name'],
            conditions: [],
            orderBy: 'id',
            order: 'asc'
        })
        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getStar = async (req, res) => {
    let { id } = req.params;
    try {
        let r = await db.select('star', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if (r.length == 0) {
            return res.status(404).send({
                status: '404',
                message: 'Not Found'
            })
        } else {
            return res.send({
                status: '200',
                message: 'Success',
                data: r[0]
            })
        }
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}


exports.addBanner = async (req, res) => {
    let { id, name, data, star, type } = req.body;

    try {
        if (id) {
            let r = await db.update('banner', {
                fields: {
                    name, data, star, type
                },
                conditions: [
                    ['id', '=', id]
                ]
            })
            return res.send({
                status: '200',
                message: 'Success',
                data: r
            })
        } else {
            let r = await db.insert('banner', {
                name, data, star, type
            })

            return res.send({
                status: '200',
                message: 'Success',
                data: r
            })
        }
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getBanners = async (req, res) => {
    let { star } = req.query;

    try {
        console.log(star)
        let r = await db.select('banner', {
            fields: ['*'],
            conditions: [['star', '=', star]]
        })
        if(req.user){
            let bannerIds = r.map((v) => v.id)
            // get all banners in reminder table 
            let reminders = await db.select('reminder', {
                fields: ['*'],
                conditions: [['banner', 'in', bannerIds], ['owner', '=', req.user.id]]
            })
            for(let i = 0; i < r.length; i++){
                let reminder = reminders.find((v) => `${v.banner}` == `${r[i].id}`)
                if(reminder){
                    delete reminder.banner
                    r[i].reminder = reminder
                }
            }
        }
        return res.send({
            status: '200',
            message: 'Success',
            data: r
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}