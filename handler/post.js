require('dotenv').config();
const db = require('../service/chat/postgres')
const { NotificationType, InteractionType } = require('../consts/enums.js');
const { notify, revokeNotify } = require('./notification.js');
const http = require('https');
const fs = require('fs');
const session = require('./session.js');

const {Achievement} = require('../consts/enums.js')
const achieve = require('../handler/achievment.js')
// const tf = require('@tensorflow/tfjs-node');
// const mobilenet = require('@tensorflow-models/mobilenet');

// const postArch = tf.sequential({
//     layers: [
//       tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
//       tf.layers.dense({ units: 1, activation: 'sigmoid' }),
//     ],
//   });
//   postArch.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });

exports.createPost = async (req, res) => {
    const { media, metadata, location, privacies, type, variant, collabs, tags, state, visibility, categories, members} = req.body;
    const user_id = req.user.id;


    if (!media || !metadata) {
        return res.send({
            status: '200',
            message: 'Media or metadata is missing'
        })
    }

    let classes = [];
    // const model = await mobilenet.load();
    const model = {};
    for (let e of media) {
        let res = await clasify(e, model);
            classes.push(...res);
    }
    metadata.classes = classes;

    if (metadata.desc) {
        metadata.tags = extractHashtags(metadata.desc);
        try {
            for (let f of metadata.tags) {
                await db.insert('hashtag', {
                    'tag': f
                })
            }
        } catch (e) { }

    }
    let payload = {
        'owner': user_id,
        'metadata': metadata,
        'type': type || 0,
        'variant': variant || 0,
        'state': state || 0,
        'visibility': visibility || 0,
        'categories': categories || [],
        'star': req.user.star,
        'members': members || false
    }

    if(collabs){
        // collabs.map((e) => e.id)
        payload.collabs = []
    }
    if(tags){
        payload.tags = tags.map((e) => e.id)
    }

    if (privacies) {
        payload.privacies = privacies;
    }
    if (location) {
        payload.lid = location.id;
    }

    const post = await db.insert('post', payload, 'id');

    for (let e of media) {
        console.log(e.content)
        let f = await db.insert('media', {
            'post': post[0].id,
            'content': e.content,
            'audio': e.audio,
            'type': e.type,
            'owner': user_id
        }, 'id')
        e.id = f[0].id;
    }

    let af = await db.select('post', {
        fields: ['*'],
        conditions: [
            ['id', '=', post[0].id]
        ]
    })

    let obj = {
        id: post[0].id,
        media: media,
        metadata: metadata,
        created_at: af[0].date,
        location: location,
        // location: location ? location.id : null,
        privacies: privacies,
        owner: user_id,
        collabs: collabs,
        tags: tags,
        type: payload.type,
        variant: payload.variant,
        state: payload.state,
        user: req.user,
        visibility: payload.visibility,
        members: members
    };

    console.log(obj)
    postJob(obj, req, false);
    achieve.addAchievement(Achievement.post, req.user.id)
    return res.send({
        status: '200',
        message: 'Post created successfully',
        data: obj
    });
}


exports.updatePost = async (req, res) => {
    const post_id = req.params.id;
    const { media, metadata, location, privacies, type, variant, collabs, tags, state, visibility, categories, members} = req.body;
    const user_id = req.user.id;

    let pp = await db.select('post', {
        fields: ['*'],
        conditions: [
            ['id', '=', post_id],
            ['owner', '=', user_id]
        ]
    })
    if(pp.length == 0){
        return res.status(401).send({
            status: '401',
            message: 'Post not found or you are not the owner'
        })
    }
    let cur = pp[0];
    let classes = [];
    // const model = await mobilenet.load();
    const model = {};
    for (let e of media) {
        let res = await clasify(e, model);
            classes.push(...res);
    }
    metadata.classes = classes;

    if (metadata.desc) {
        metadata.tags = extractHashtags(metadata.desc);
        try {
            for (let f of metadata.tags) {
                await db.insert('hashtag', {
                    'tag': f
                })
            }
        } catch (e) { }

    }
    let payload = {
        'owner': user_id,
        'metadata': metadata,
        'type': type || 0,
        'variant': variant || 0,
        'state': state || 0,
        'visibility': visibility || 0,
        'categories': categories || [],
        'members': members || false
    }

    var toAdd = [];
    if(collabs){
        let oldCollabs = cur.collabs || [];
        let newCollabs = collabs.map((e) => e.id);
        let toRemove = oldCollabs.filter((e) => !newCollabs.includes(e));
        toAdd = newCollabs.filter((e) => !oldCollabs.includes(e));
        // remove toRemove from oldColabs
        for(let e of toRemove){
            oldCollabs.splice(oldCollabs.indexOf(e), 1);
        }
        payload.collabs = oldCollabs;
    }
    if(tags){
        payload.tags = tags.map((e) => e.id)
    }

    if (privacies) {
        payload.privacies = privacies;
    }
    if (location) {
        payload.lid = location.id;
    }

    const post = await db.update('post', {
        fields: payload,
        conditions: [
            ['id', '=', post_id]
        ]
    });

    let af = await db.select('post', {
        fields: ['*'],
        conditions: [
            ['id', '=', post_id]
        ]
    })

    let cc = []

    for(let e of toAdd){
        for(let f of collabs){
            if(f.id == e){
                cc.push(f)
            }
        }
    }

    let obj = {
        id: post_id,
        media: media,
        metadata: metadata,
        created_at: af[0].date,
        location: location,
        // location: location ? location.id : null,
        privacies: privacies,
        owner: user_id,
        collabs: cc,
        tags: tags,
        variant: payload.variant,
        type: payload.type,
        state: payload.state,
        user: req.user,
        visibility: payload.visibility
    };

    console.log(obj)
    postJob(obj, req, true);
    return res.send({
        status: '200',
        message: 'Post updated successfully',
        data: obj
    });
}

async function postJob(post, req, edit){
    if(post.collabs){
        for(let e of post.collabs){
            await notify(req, e.id, NotificationType.collabRequest, {
                sender: post.owner,
                post: post.id
            })
        }
    }
    if(post.tags){
        for(let e of post.tags){
            await notify(req, e.id, NotificationType.tag, {
                sender: post.owner,
                post: post.id
            })
        }
    }
    if(!edit){
        session.watchers(req, {
            send: (data) => {
                for(let e of data.data){
                    notify(req, e, NotificationType.postShared, {
                        sender: post.owner,
                        post: post.id
                    })
                }
            }
        })
    }
}

async function testRunHashTag() {
    let data = await db.select('post')
    for (let e of data) {
        let hashtags = extractHashtags((e.metadata || {}).desc || '');
        e.metadata = e.metadata || {};
        e.metadata.tags = hashtags;
        for (let f of hashtags) {
            try {
                await db.insert('hashtag', {
                    'tag': f
                })
            } catch (e) { }
        }
        await db.update('post', {
            fields: { metadata: e.metadata },
            conditions: [
                ['id', '=', e.id]
            ]
        })
    }
}

async function testRunImageClification() {
    let data = await db.select('media')
    const model = await mobilenet.load();
    for (let e of data) {
        // console.log(e)
        if ((e.content || {}).main) {
            //download image to public/images folder
            //run image classification
            //save result to database
            let res = await clasify(e, model);
            console.log(res)
            console.log('-----------------')
        }
    }
}

async function clasify(e, model) {
    let classes = []
    return classes;
    console.log(e)
    if ((e.content || {}).main) {
        let buffer = await new Promise(resolve => {
            downloadFile(e.content.main, resolve);
        });
        try {
            const imgTensor = tf.node.decodeImage(buffer, 3);
            const predictions = await model.classify(imgTensor);
            console.log(predictions)
            for (let f of predictions) {
                let l = f.className.split(',').map((f) => f.trim());

                classes.push(...l);
            }
        } catch (error) {
            console.log(error)
        }
    }
    return classes;
}


///extract hashtags from text without duplicates
extractHashtags = (text) => {
    let hashtags = [];
    text.split(' ').forEach((word) => {
        if (word[0] === '#') {
            hashtags.push(word);
        }
    });
    return [...new Set(hashtags)];
}

downloadFile = async (url, cb) => {
    //create file if not exist

    const response = await new Promise(resolve => {
        http.get(url, resolve);
    });

    let responseData = Buffer.alloc(0);

    response.on('data', (chunk) => {
        responseData = Buffer.concat([responseData, chunk]);
    });

    response.on('end', () => {
        cb(responseData);
    })
}

exports.getSharaeablePost = async (req, res) => {
    const { id } = req.params;
    // const user_id = req.user.id;

    try {
        let result = await db.select('post', {
            fields: ['*'],
            conditions: [
                ['id', '=', id],
            ]
        });

        if (result.length == 0) {
            return res.status(404).json({
                status: '404',
                message: 'Post not found'
            });
        }

        let data = result[0];

        let media = await db.select('media', {
            fields: ['*'],
            conditions: [
                ['post', '=', id],
            ]
        })

        data.media = media;

        let owner = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', '=', data.owner],
            ]
        })

        if(owner.length > 0){
            data.user = owner[0];
        }

        data.link = `${process.env.DOMAIN_URL}/post#?id=${data.id}`;

        return res.send({
            status: '200',
            message: 'Success',
            data: data
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.state = async (req, res) => {
    const { id, s} = req.params;
    const user_id = req.user.id;
    var state = 0;
    if(s == 'publish' || s == 'published' || s == 'public' || s == 'unarchive' || s == 'unpin'){
        state = 0;
    }
    if(s == 'pin'){
        state = 1;
    }
    if(s == 'archive'){
        state = 2;
    }


    try {
        let result = await db.select('post', {
            fields: ['*'],
            conditions: [
                ['id', '=', id],
                ['owner', '=', user_id]
            ]
        });

        if (result.length == 0) {
            return res.status(404).json({
                status: '404',
                message: 'Post not found'
            });
        }

        let data = result[0];
        data.state = state;

        await db.update('post', {
            fields: {
                state: state
            },
            conditions: [
                ['id', '=', id]
            ]
        });

        return res.send({
            status: '200',
            message: 'Success',
            data: data
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.archived = async (req, res) => {
    try {
        let data = await db.fun('get_archived_post_list', {
            params: `${req.user.id}`
        });

        return res.send({
            status: '200',
            message: 'Success',
            data: data
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}