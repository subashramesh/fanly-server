const db = require('../service/chat/postgres')

exports.createCollection = async (req, res) => {
    let {name, data, collabs, posts} = req.body;

    let payload = {
        'name': name,
        'owner': req.user.id,
        'data': data
    }

    try {
        let result = await db.insert('collection', payload, 'id');
        payload.id = result[0].id;

        if(posts){
            for(let e of posts){
                await db.knex('saved').insert({
                    owner: req.user.id,
                    post: e.id,
                    collection: payload.id
                }).onConflict(['owner', 'post']).merge()
            }
        }
        payload.posts = posts;
        return res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch(e){
        console.log(e)
        return res.send({
            status: '500',
            message: 'Error creating collection'
        })
    }
}

exports.getCollections = async (req, res) => {
    try{
        let result = await db.select('collection', {
            conditions: [
                ['owner', '=', req.user.id]
            ],
            fields: ['*'],
        });
        return res.send({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e){
        console.log(e)
        return res.send({
            status: '500',
            message: 'Error getting collections'
        })
    }
}

exports.addToCollection = async (req, res) => {
    let {posts} = req.body;
    let {id} = req.params;

    try {
        for(let e of posts){
            await db.knex('saved').insert({
                owner: req.user.id,
                post: e.id,
                collection: id
            }).onConflict(['owner', 'post']).merge()
        }
        return res.send({
            status: '200',
            message: 'Success',
        })
    } catch(e){
        console.log(e)
        return res.send({
            status: '500',
            message: 'Error adding to collection'
        })
    }
}

exports.removeFromCollection = async (req, res) => {
    let {posts} = req.body;
    let {id} = req.params;

    try {
        let ids = []
        for(let e of posts){
            ids.push(e.id)
        }
        await db.update('saved', {
            fields: {collection: null},
            conditions: [
                ['owner', '=', req.user.id],
                ['post', 'in', ids],
                ['collection', '=', id]
            ]
        })
    } catch(e){
        console.log(e)
        return res.send({
            status: '500',
            message: 'Error removing from collection'
        })
    }
}

exports.deleteCollection = async (req, res) => {
    let {id} = req.params;

    try {
        await db.delete2('collection', {
            conditions: [
                ['id', '=', id],
                ['owner', '=', req.user.id]
            ]
        })
        await db.update('saved', {
            fields: {collection: null},
            conditions: [
                ['owner', '=', req.user.id],
                ['collection', '=', id]
            ]
        })
        return res.send({
            status: '200',
            message: 'Success',
        })
    } catch(e){
        console.log(e)
        return res.send({
            status: '500',
            message: 'Error deleting collection'
        })
    }
}