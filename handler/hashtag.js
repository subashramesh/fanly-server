require('dotenv').config();
const db = require('../service/chat/postgres')
const feeds = require('./feeds.js')

exports.get = async (req, res) => {
    const  hashtag  = `#${req.params.tag}`;

    const tags = await db.select('hashtag_view', {
        fields: ['*'],
        conditions: [
            ['hashtag', '=', hashtag]
        ]
    });
    if(tags.length){
        const follow = await db.select('follow_hashtag', {
            fields: ['*'],
            conditions: [
                ['uid', '=', req.user.id],
                ['tag', '=', hashtag]
            ]
        });
        tags[0].im_following = follow.length ? true : false;

        return res.send({
            status: '200',
            message: 'OK',
            data: tags[0]
        });
    } else {
        return res.send({
            status: '404',
            message: 'Not Found',
            data: null
        });
    }
}

exports.posts = async (req, res) => {
    const  hashtag  = `#${req.params.tag}`;
    const  type  = req.params.type;

    switch(type){
        case 'reels':
        case 'top':
        case 'recent':
            const recent = await db.fun('get_hashtag_post_list', {
                params: `${req.user.id}, '${hashtag}'`
            })
            let data = await feeds.processPosts(req, recent);
            return res.send({
                status: '200',
                message: 'OK',
                data: data
            });
        default:
            return res.send({
                status: '400',
                message: 'Bad Request (type is not valid) allow [reels, top, recent]',
                data: null
            });

    }


}

exports.follow = async (req, res) => {
    const  hashtag  = `#${req.params.tag}`;

    const follow = await db.select('follow_hashtag', {
        fields: ['*'],
        conditions: [
            ['uid', '=', req.user.id],
            ['tag', '=', hashtag]
        ]
    });

    if(follow.length){
        return res.send({
            status: '400',
            message: 'Bad Request (already following)',
            data: null
        });
    } else {
        await db.insert('follow_hashtag', {
            tag: hashtag,
            uid: req.user.id
        }, 'id');

        return res.send({
            status: '200',
            message: 'OK',
            data: null
        });
    }
}

exports.unfollow = async (req, res) => {
    const  hashtag  = `#${req.params.tag}`;

    const follow = await db.select('follow_hashtag', {
        fields: ['*'],
        conditions: [
            ['uid', '=', req.user.id],
            ['tag', '=', hashtag]
        ]
    });

    if(follow.length){
        await db.delete2('follow_hashtag', {
            conditions: [
                ['uid', '=', req.user.id],
                ['tag', '=', hashtag]
            ]
        });

        return res.send({
            status: '200',
            message: 'OK',
            data: null
        });
    } else {
        return res.send({
            status: '400',
            message: 'Bad Request (not following)',
            data: null
        });
    }
}