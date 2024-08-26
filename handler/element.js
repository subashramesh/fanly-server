const db = require('../service/chat/postgres')

exports.elements = async (req, res) => {
    let body = req.body;
    if(!Array.isArray(body)){
        return res.status(400).json({
            status: '400',
            message: 'Bad Request'
        })
    }

    try {
        console.log(body)
        let payload = body.map((item) => {
            let d = {
                owner: `${req.user.id}`,
                status: item.status,
                post: item.post,
                data: item.data,
                updated_at: new Date(),  
                type: item.type 
            } 
            if(item.id){
                d.id = item.id
            }
            return d
        })

        let result = await db.knex('element').insert(payload, 'id').onConflict(['id']).merge()
        for(let i = 0; i < result.length; i++){
            payload[i].id = result[i].id
        }
        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.interact = async (req, res) => {
    let body = req.body;

    try {
        let payload = {
            owner: `${req.user.id}`,
            data: body.data,
            updated_at: new Date(),
            type: body.type,
            status: body.status,
            post: body.post,
            element: body.element 
        }
        if(body.id){
            payload.id = body.id
        }

        let result = await db.knex('element_activity').insert(payload, 'id').onConflict(['id']).merge()
        payload.id = result[0].id

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}

exports.get = async (req, res) => {
    let {id, type} = req.params;

    try {
        let queries = []
        switch(type){
            case 'post':
                queries.push(['post', '=', id])
                break;
            case 'story':
            case 'status':
                queries.push(['status', '=', id])
                break;
        }
        // queries.push(['owner', '=', req.user.id])
        let result = await db.select('element', {
            fields: ['*'],
            conditions: queries
        })

        let ids = result.map((e) => e.id)

        let activities = await db.select('element_activity', {
            fields: ['*'],
            conditions: [
                ['element', 'in', ids]
            ]
        })
        // console.log('got act: ',activities)
        let data = []

        for(let i = 0; i < result.length; i++){
            let item = result[i]
            let d = {
                ...item,
                activities: []
            }
            for(let j = 0; j < activities.length; j++){
                let activity = activities[j]
                if(activity.element === item.id){
                    d.activities.push(activity)
                }
            }
            data.push(d)
        }
        // console.log(data)
        res.send({
            status: '200',
            message: 'Success',
            data: data
        })
    } catch(e){
        console.log(e)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}