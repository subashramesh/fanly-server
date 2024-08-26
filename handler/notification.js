const { NotificationType } = require('../consts/enums.js');
const messaging = require('../service/firebase/messaging.js')
const db = require('../service/chat/postgres.js');
const chat = require('./chat.js');
const feeds = require('./feeds.js');

async function notify(req, user_id, type, data,) {
    var title = req.user.dname
    let channel = data.channel;
    if(channel){
        let c = await db.select('channel', {
            fields: ['*'],
            conditions: [
                ['id', '=', channel]
            ]
        })
        if(c.length > 0){
            title = c[0].name
        }
        delete data.channel;
    } else {
        title = await chat.getOnlyName(req.user.id, user_id)
    }

    
    // if(type == NotificationType.storyLike){
    //     title = await chat.getOnlyName(req.user.id, user_id)
    // }

    var body = ''
    switch(type){
        case NotificationType.like: 
        body = `liked your post`
        break;
        case NotificationType.comment:
        body = `commented on your post`    
        break;
        case NotificationType.follow: 
        body = `started following you`
        break;
        case NotificationType.followRequest: 
        body = `sent you a follow request`
        break;
        case NotificationType.followAccepted:
        body = `accepted your follow request`
        case NotificationType.mention: break;
        case NotificationType.reply: break;
        case NotificationType.commentLike: 
        body = `liked your comment`
        break;
        case NotificationType.replyLike: break;
        case NotificationType.storyLike: 
        body = `liked your story`
        break;
        case NotificationType.collabRequest: 
        body = `sent you a collab request`
        break;    
        case NotificationType.collabAccepted: 
        body = `accepted your collab request`
        break;
        case NotificationType.collabDeclined:
        body = `declined your collab request`
        break;
        case NotificationType.commentMention: 
        body = `mentioned you in a comment`
        break;
        case NotificationType.replyMention: break;
        case NotificationType.storyMention: break;
        case NotificationType.postShared: 
        body = `shared new post`
        break;
        case NotificationType.suggestPeople: break;
        case NotificationType.live: 
        body = `started a live.`
        break;
        case NotificationType.tag:
        body = `tagged you in a post`
        break;
        case NotificationType.react:
        body = `reacted to your post`
        break;
    }
    data.type = type;
    data.owner = user_id;
    console.log(`sending notification to ${user_id} ${title} ${body} ${JSON.stringify(data)}`)
    let res = await db.insert('activity', data, 'id');
    console.log(res)
    data.id = res[0].id;
    let tokens = await chat.getTokens(user_id);
    if(tokens.length > 0){
        let d = {
            type: 'activity',
            payload: JSON.stringify(data)
        }
        if(type != NotificationType.postShared){
        await messaging.message(tokens, d, {
            title,
            body
        });
    }
    }

    return data;
}

async function revokeNotify(user_id, type, data){
    switch(type){
        case NotificationType.like: break;
        case NotificationType.comment: break;
        case NotificationType.follow: 
        case NotificationType.followRequest:
        await db.delete2('activity', {
            conditions: [
                ['owner', '=', user_id],
                ['type', '=', type],
                ['sender', '=', data.sender],
            ]
        })
        break;
        case NotificationType.mention: break;
        case NotificationType.reply: break;
        case NotificationType.commentLike: break;
        case NotificationType.replyLike: break;
        case NotificationType.storyLike:
            await db.delete2('activity', {
                conditions: [
                    ['owner', '=', user_id],
                    ['type', '=', type],
                    ['status', '=', data.status],
                    ['sender', '=', data.sender],
                ]
            })
            break;
        case NotificationType.commentMention: break;
        case NotificationType.replyMention: break;
        case NotificationType.storyMention: break;
        case NotificationType.postShared: break;
        case NotificationType.suggestPeople: break;
        case NotificationType.react: 
        await db.delete2('activity', {
            conditions: [
                ['owner', '=', user_id],
                ['type', '=', type],
                ['post', '=', data.post],
                ['sender', '=', data.sender],
            ]
        })
        break;
    }
}

exports.notify = notify;
exports.revokeNotify = revokeNotify;

exports.getActivities = async (req, res) => {
    const  user_id  = req.user.id;

    let activities = await db.fun('get_activity', {
        params: `${user_id}`
    })
    var posts = {};
    for(let i = 0; i < activities.length; i++){
        let e = activities[i];
        if(e.pid != null && e.pid != undefined && e.post != null && e.post != undefined){
            posts[e.pid] = e.post;
        }
    }
    var postList = [];
    for(let i in posts){
        postList.push(posts[i]);
    }
    let rr = await feeds.processPosts(req, postList);
    var res1 = {};
    for(let i = 0; i < rr.length; i++){
        let e = rr[i];
        res1[e.id] = e;
    }
    for(let i = 0; i < activities.length; i++){
        let e = activities[i];
        if(e.pid){
            e.post = res1[e.pid];
        }
    }

    return res.send({
        status: '200',
        message: 'Activities fetched successfully',
        data: activities
    });
}

exports.seenActivity = async (req, res) => {
    const  user_id  = req.user.id;
    const {id} = req.params;

    let activities = await db.update('activity', {
        fields: {seen: new Date()},
        conditions: [
            ['id', '=', id],
            ['owner', '=', user_id]
        ]
    })
    


    return res.send({
        status: '200',
        message: 'Activities seen successfully',
        data: activities
    });
}

exports.notification = async (req, res) => {
    let body = req.body;
    let payload = {
        owner: `${req.user.id}`,
        data: body.data,
        box: body.box,
        updated_at: new Date()
    }

    try {
        let result = await db.knex('notification').insert(payload, 'id').onConflict(['owner', 'box']).merge()
        payload.id = result[0].id

        res.send({
            status: '200',
            message: 'Success',
            data: payload
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error'
        })
    }
}