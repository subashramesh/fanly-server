require('dotenv').config();
const db = require('../service/chat/postgres.js');
const notification = require('./notification.js');
const { NotificationType, InteractionType } = require('../consts/enums.js');
const socket = require('./chat_socket.js')

exports.processPosts = processPosts
async function processPosts(req, posts) {
    let data = [];
    let ids = posts.map(e => e.id);

    let reactions = await db.select('post_reaction', {
        fields: ['*'],
        conditions: [
            ['post', 'in', ids]
        ]
    })

    for(let e of posts){
        let rs = reactions.filter(r => r.post == e.id);
        let mine = rs.filter(r => r.owner == req.user.id);
        let reaction = {
            reactions: rs.length,
            map: {}
        }
        let reactMap = {};
        for(let r of rs){
            if(reactMap[r.type] == undefined){
                reactMap[r.type] = {
                    type: r.type,
                    text: r.text,
                    count: 1
                };
            } else {
                reactMap[r.type].count++;
            }
        }
        reaction.map = reactMap;

        if(mine.length > 0){
            reaction.mine = mine[0];
        }

        data.push({
            ...e,
            reaction
        })
    }
    return data;
}

exports.feeds = async (req, res) => {
    const { type } = req.params;
    

    try {
        const id = req.user.id;
        const limit = req.query.limit || 100;
        const offset = req.query.offset || 0;
        switch (type) {
            case 'following':
                let con = await db.select('contact', {
                    fields: ['*'],
                    conditions: [
                        ['user', '=', req.user.id]
                    ]
                })
                let phones = con.map((item) => item.phone)
                
                let acc = await db.select('account', {
                    fields: ['*'],
                    conditions: [
                        ['normalized', 'in', phones]
                    ]
                })
                let followings = await db.select('follow', {
                    fields: ['*'],
                    conditions: [
                        ['owner', '=', req.user.id]
                    ]
                })
                var idList = [];
                idList.push(req.user.id);
                var ids = '';
                acc.forEach(e => {
                    idList.push(e.id)
                })
                followings.forEach(e => {
                    idList.push(e.user)
                })
                // remove duplicates
                idList = [...new Set(idList)];
                idList.forEach(e => {
                    ids += `${e},`
                })
                ids = ids.substring(0, ids.length - 1);
                const following = await db.fun('get_feeds', {
                    params: `${id},${limit},${offset},'{${ids}}'::bigint[]`
                });
                let data = await processPosts(req, following);
    
                return res.send({
                    status: '200',
                    message: 'OK',
                    data: data
                });
            case 'public':
                const popular = await db.fun('get_public_posts', {
                    params: `${id},${limit},${offset}`
                });
                let data2 = await processPosts(req, popular);
    
                return res.send({
                    status: '200',
                    message: 'OK',
                    data: data2
                });
            case 'explore':
                const explore = await db.fun('get_public_posts', {
                    params: `${id},${limit},${offset}`
                });
                let data3 = await processPosts(req, explore);
    
                return res.send({
                    status: '200',
                    message: 'OK',
                    data: data3
                });
            case 'reels':
                    const reels = await db.fun('get_public_reels', {
                        params: `${id},${limit},${offset}`
                    });
                    let data4 = await processPosts(req, reels);
        
                    return res.send({
                        status: '200',
                        message: 'OK',
                        data: data4
                    });
            case 'suggest':
                let account = await db.select('account', {
                    fields: ['categories'],
                    conditions: [
                        ['id', '=', req.user.id]
                    ]
                })
                let ids5 = account[0].categories;
                var sss = '';
                ids5.forEach(e => {
                    sss += `${e},`
                })
                sss = sss.substring(0, sss.length - 1);
                const suggest = await db.fun('get_category_post', {
                     params: `${id},${limit},${offset},'{${sss}}'::bigint[]`
                })
                let data5 = await processPosts(req, suggest);

                return res.send({
                    status: '200',
                    message: 'OK',
                    data: data5
                });
            default:
                return res.send({
                    status: '400',
                    message: 'Bad Request (type is not valid, allowed types following, public, reels) ',
                    data: null
                });
        }
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: `Internal Server Error ${e}`,
            data: null
        });
    }
}

exports.savePost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const save = await db.knex('saved').insert({
        owner: user_id,
        post: id
    }, 'id').onConflict(['owner', 'post']).merge()

    return res.send({
        status: '200',
        message: 'OK',
        data: save
    });
}

exports.unSavePost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const unsave = await db.delete2('saved', {
        conditions: [
            ['owner', '=', user_id],
            ['post', '=', id]
        ]
    })

    return res.send({
        status: '200',
        message: 'OK',
        data: unsave
    });
}

exports.likePost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const like = await db.insert('like', {
        owner: user_id,
        post: id
    }, 'id')
    try {
        let post = await db.select('post', {
            fields: ['owner', 'metadata'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (post[0].owner != user_id) {
            await notification.notify(req, post[0].owner, NotificationType.like, {
                post: id,
                sender: user_id
            });
            await db.insert('interaction', {
                owner: user_id,
                post: id,
                type: InteractionType.like,
                data: post[0].metadata
            }, 'id')
        }
    } catch (error) {
        console.log(error)
    }
    return res.send({
        status: '200',
        message: 'OK',
        data: like
    });
}

exports.reactPost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const { type, text} = req.body;

    if (!id || (type === undefined || type === null)) {
        return res.send({
            status: '400',
            message: 'Bad Request (id or type is empty)',
            data: null
        });
    }

    let payload = {
        owner: user_id,
        post: id,
        type,
        text
    };
    const react = await db.knex('post_reaction').insert(payload, 'id').onConflict(['post', 'owner']).merge()

    try {
        let post = await db.select('post', {
            fields: ['owner', 'metadata'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (post[0].owner != user_id) {
            await notification.revokeNotify(post[0].owner, NotificationType.react, {
                post: id,
                sender: user_id
            });
            await notification.notify(req, post[0].owner, NotificationType.react, {
                post: id,
                sender: user_id
            });
            await db.insert('interaction', {
                owner: user_id,
                post: id,
                type: InteractionType.react,
                data: post[0].metadata
            }, 'id')
        }
    } catch (error) {
        console.log(error)
    }

    return res.send({
        status: '200',
        message: 'OK',
        data: react
    });
}

exports.unReactPost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id or type is empty)',
            data: null
        });
    }

    const unReact = await db.delete2('post_reaction', {
        conditions: [
            ['owner', '=', user_id],
            ['post', '=', id]
        ]
    })

    try {
        let post = await db.select('post', {
            fields: ['owner', 'metadata'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (post[0].owner != user_id) {
            await notification.revokeNotify(post[0].owner, NotificationType.react, {
                post: id,
                sender: user_id
            });
            await db.delete2('interaction', {
                conditions: [
                    ['owner', '=', user_id],
                    ['post', '=', id],
                    ['type', '=', InteractionType.react]
                ]
            })
        }
    } catch (error) {
        console.log(error)
    }

    return res.send({
        status: '200',
        message: 'OK',
        data: unReact
    });
}

exports.interested = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    
    try {
        const interest = await db.insert('interest', {
            owner: user_id,
            post: id
        }, 'id')
        let post = await db.select('post', {
            fields: ['owner', 'metadata'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (post[0].owner != user_id) {
            await notification.notify(req, post[0].owner, NotificationType.interest, {
                post: id,
                sender: user_id
            });
            await db.insert('interaction', {
                owner: user_id,
                post: id,
                type: InteractionType.interest,
                data: post[0].metadata
            }, 'id')
        }
        return res.send({
            status: '200',
            message: 'OK',
            data: interest
        });
    } catch (error) {
        console.log(error)
    }
    
}

exports.viewPost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }
    try {
        const like = await db.insert('view', {
            owner: user_id,
            post: id
        }, 'id')
        let post = await db.select('post', {
            fields: ['owner', 'metadata'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (post[0].owner != user_id) {
            await db.insert('interaction', {
                owner: user_id,
                post: id,
                type: InteractionType.view,
                data: post[0].metadata
            }, 'id')
        }
        return res.send({
            status: '200',
            message: 'OK',
            data: like
        });
    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'OK',
        });
    }

    
}

exports.notInterested = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        if (!id) {
            return res.send({
                status: '400',
                message: 'Bad Request (id is empty)',
                data: null
            });
        }

        const interest = await db.delete2('interest', {
            conditions: [
                ['owner', '=', user_id],
                ['post', '=', id]
            ]
        })
        let post = await db.select('post', {
            fields: ['owner', 'metadata'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (post[0].owner != user_id) {
            await notification.revokeNotify(post[0].owner, NotificationType.interest, {
                post: id
            });
            await db.delete2('interaction', {
                conditions: [
                    ['owner', '=', user_id],
                    ['post', '=', id],
                    ['type', '=', InteractionType.interest]
                ]
            })
        }
        return res.send({
            status: '200',
            message: 'OK',
            data: interest
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        })

    }
}

exports.unlikePost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const unlike = await db.delete2('like', {
        conditions: [
            ['owner', '=', user_id],
            ['post', '=', id]
        ]
    })

    try {
        let post = await db.select('post', {
            fields: ['owner'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if (post[0].owner != user_id) {
            await notification.revokeNotify(post[0].owner, NotificationType.like, {
                sender: user_id,
                post: id
            });
            db.delete2('interaction', {
                conditions: [
                    ['owner', '=', user_id],
                    ['post', '=', id],
                    ['type', '=', InteractionType.like]
                ]
            })

        }
    } catch (error) {

    }

    return res.send({
        status: '200',
        message: 'OK',
        data: unlike
    });
}

exports.userPosts = async (req, res) => {
    const { id } = req.params;

    if (id) {
        let data = await db.fun('get_user_post_list', {
            params: `${req.user.id}, ${id}`
        });

        if (data) {
            let data2 = await processPosts(req, data);
            return res.send({
                status: '200',
                message: 'OK',
                data: data2
            })
        } else {
            return res.send({
                status: '404',
                message: 'User not found',
                data: null
            })
        }
    } else {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        })
    }
}

exports.userTaggedPosts = async (req, res) => {
    const { id } = req.params;
    const { limit, offset} = req.query;

    if (id) {
        let data = await db.fun('get_user_tagged_post_list', {
            params: `${req.user.id}, ${id}, ${limit || 1000}, ${offset || 0}`
        });

        if (data) {
            let data2 = await processPosts(req, data);
            return res.send({
                status: '200',
                message: 'OK',
                data: data2
            })
        } else {
            return res.send({
                status: '404',
                message: 'User not found',
                data: null
            })
        }
    } else {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        })
    }
}


exports.userReels = async (req, res) => {
    const { id } = req.params;

    if (id) {
        let data = await db.fun('get_user_reels_list', {
            params: `${req.user.id}, ${id}`
        });

        if (data) {
            let data2 = await processPosts(req, data);
            return res.send({
                status: '200',
                message: 'OK',
                data: data2
            })
        } else {
            return res.send({
                status: '404',
                message: 'User not found',
                data: null
            })
        }
    } else {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        })
    }
}

exports.commentPost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const { text, mentions} = req.body;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    if (!text) {
        return res.send({
            status: '400',
            message: 'Bad Request (comment is empty)',
            data: null
        });
    }

    const commentPost = await db.insert('comment', {
        owner: user_id,
        post: id,
        text: text
    }, 'id')

    try {
        let post = await db.select('post', {
            fields: ['owner', 'tags', 'collabs'],
            conditions: [
                ['id', '=', id]
            ]
        })

        var people = []

        let collabs = post[0].collabs
        let tags = post[0].tags

        // add all collabs and mentions to people
        if (collabs) {
            people.push(...collabs)
        }
        if (tags) {
            people.push(...tags)
        }

        //remove duplicates from people
        people = [...new Set(people)]

        if (people) {
            for(let i = 0; i < people.length; i++){
                if (people[i] != user_id) {
                    notification.notify(req, people[i], NotificationType.comment, {
                        sender: user_id,
                        post: id,
                        comment: commentPost[0].id
                    });
                }
            }
        }

        


        if (post[0].owner != user_id) {
            notification.notify(req, post[0].owner, NotificationType.comment, {
                sender: user_id,
                post: id,
                comment: commentPost[0].id
            });
        }
        if(mentions){
            mentions.forEach(async (e) => {
                notification.notify(req, e.id, NotificationType.commentMention, {
                    sender: user_id,
                    post: id,
                    comment: commentPost[0].id
                });
            })
        }
    } catch (error) {

    }

    return res.send({
        status: '200',
        message: 'OK',
        data: {
            id: commentPost[0].id,
            text: text,
            owner: user_id,
        }
    });
}

exports.deleteComment = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }
    try {
        let comment = await db.select('comment', {
            fields: ['owner', 'post'],
            conditions: [
                ['id', '=', id]
            ]
        })
        notification.revokeNotify(comment[0].owner, NotificationType.comment, {
            sender: user_id,
            post: comment[0].post,
            comment: id
        });
    } catch (error) {

    }
    const deleteComment = await db.delete2('comment', {
        conditions: [
            ['owner', '=', user_id],
            ['id', '=', id]
        ]
    })

    return res.send({
        status: '200',
        message: 'OK',
        data: deleteComment
    });
}

exports.getComments = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const comments = await db.fun('get_comment_list', {
        params: `${user_id},${id}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: comments
    });
}

exports.getLikes = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const likes = await db.fun('get_like_list', {
        params: `${user_id},${id}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: likes
    });
}

exports.getInterests = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const interests = await db.fun('get_interest_list', {
        params: `${user_id},${id}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: interests
    });
}

exports.getReactions = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const interests = await db.fun('get_reaction_list', {
        params: `${user_id},${id}, ${req.query.type || ''}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: interests
    });
}

exports.likeComment = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        if (!id) {
            return res.send({
                status: '400',
                message: 'Bad Request (id is empty)',
                data: null
            });
        }

        const like = await db.insert('comment_like', {
            owner: user_id,
            comment: id
        }, 'id')

        try {
            let comment = await db.select('comment', {
                fields: ['owner', 'post'],
                conditions: [
                    ['id', '=', id]
                ]
            })
            if (comment[0].owner != user_id) {
                notification.notify(req, comment[0].owner, NotificationType.commentLike, {
                    sender: user_id,
                    comment: id,
                    post: comment[0].post
                });
            }
        } catch (error) {

        }

        return res.send({
            status: '200',
            message: 'OK',
            data: like
        });
    } catch (error) {
        return res.send({
            status: '400',
            message: 'Bad Request',
            data: null
        });
    }



}

exports.unlikeComment = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const unlike = await db.delete2('comment_like', {
        conditions: [
            ['owner', '=', user_id],
            ['comment', '=', id]
        ]
    })

    try {
        let comment = await db.select('comment', {
            fields: ['owner', 'post'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if (comment[0].owner != user_id) {
            notification.revokeNotify(comment[0].owner, NotificationType.commentLike, {
                sender: user_id,
                comment: id,
                post: comment[0].post
            });
        }
    } catch (error) {

    }

    return res.send({
        status: '200',
        message: 'OK',
        data: unlike
    });
}

exports.getCommentLikes = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const likes = await db.fun('get_comment_like_list', {
        params: `${user_id},${id}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: likes
    });
}

exports.replyComment = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const { text } = req.body;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    if (!text) {
        return res.send({
            status: '400',
            message: 'Bad Request (comment is empty)',
            data: null
        });
    }

    const commentPost = await db.insert('comment', {
        owner: user_id,
        parent: id,
        text: text
    }, 'id')

    try {
        let comment = await db.select('comment', {
            fields: ['owner', 'post'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if (comment[0].owner != user_id) {
            notification.notify(req, comment[0].owner, NotificationType.reply, {
                sender: user_id,
                comment: id,
                post: comment[0].post,
                reply: commentPost[0].id
            });
        }
    } catch (error) {

    }

    return res.send({
        status: '200',
        message: 'OK',
        data: commentPost[0]
    });
}

exports.deleteReply = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const deleteComment = await db.delete2('reply', {
        conditions: [
            ['owner', '=', user_id],
            ['id', '=', id]
        ]
    })

    try {

        let comment = await db.select('comment', {
            fields: ['owner', 'post'],
            conditions: [
                ['id', '=', reply[0].comment]
            ]
        })

        if (comment[0].owner != user_id) {
            notification.revokeNotify(comment[0].owner, NotificationType.reply, {
                sender: user_id,
                reply: id,
                post: comment[0].post
            });
        }
    } catch (error) {

    }

    return res.send({
        status: '200',
        message: 'OK',
        data: deleteComment
    });
}

exports.getReplies = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const comments = await db.fun('get_reply_list', {
        params: `${user_id},${id}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: comments
    });
}

exports.getReplyLikes = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const likes = await db.fun('get_reply_like_list', {
        params: `${user_id},${id}`
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: likes
    });
}

exports.likeReply = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const like = await db.insert('reply_like', {
        owner: user_id,
        reply: id
    }, 'id')

    try {
        let reply = await db.select('reply', {
            fields: ['owner', 'comment'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if (reply[0].owner != user_id) {
            notification.notify(req, comment[0].owner, NotificationType.replyLike, {
                sender: user_id,
                comment: reply[0].comment,
                reply: id
            });
        }
    } catch (error) {

    }


    return res.send({
        status: '200',
        message: 'OK',
        data: like
    });
}

exports.unlikeReply = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const unlike = await db.delete2('reply_like', {
        conditions: [
            ['owner', '=', user_id],
            ['reply', '=', id]
        ]
    })

    try {
        let reply = await db.select('reply', {
            fields: ['owner', 'comment'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if (reply[0].owner != user_id) {
            notification.revokeNotify(comment[0].owner, NotificationType.replyLike, {
                sender: user_id,
                comment: reply[0].comment,
                reply: id
            });
        }
    } catch (error) {

    }

    return res.send({
        status: '200',
        message: 'OK',
        data: unlike
    });
}

exports.getLocations = async (req, res) => {
    const { query } = req.query;

    if (!id ) {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        });
    }

    const locations = await db.select('location', {
        fields: ['*'],
        conditions: [
            ['name', 'like', `%${query}%`]
        ]
    });

    return res.send({
        status: '200',
        message: 'OK',
        data: locations
    });
}

exports.getSaved = async (req, res) => {
    let user_id = req.user.id;
    let {limit, offset} = req.query;

    try {
        let data = await db.fun('get_saved_posts', {
            params: `${user_id}, ${limit}, ${offset}`
        });
    
        if (data) {
            let data2 = await processPosts(req, data);
            return res.send({
                status: '200',
                message: 'OK',
                data: data2
            })
        } else {
            return res.status(404).send({
                status: '404',
                message: 'No Saved posts',
                data: []
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
        })
    }
}

exports.block = async (req, res) => {
    const { id } = req.params;

    if (id) {
        try {
            let payload = {
                user: id,
                owner: req.user.id
            };
    
            let data = await db.insert('block', payload, 'id');
            // await db.delete2('follow', {
            //     conditions: [
            //         ['uid', '=', uid],
            //         ['fid', '=', req.user.id]
            //     ]
            // });
            // await db.delete2('follow', {
            //     conditions: [
            //         ['fid', '=', uid],
            //         ['uid', '=', req.user.id]
            //     ]
            // });
    
            if (data) {
                socket.send([id, req.user.id], 'block', payload);
                return res.send({
                    status: '200',
                    message: 'OK',
                    data: data
                })
            } else {
                return res.send({
                    status: '404',
                    message: 'User not found or already blocked',
                    data: null
                })
            } 
        } catch (error) {
            console.log(error)
            return res.send({
                status: '500',
                message: 'Internal Server Error',
                data: null
            })
        }
    } else {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        })
    }
}

exports.unblock = async (req, res) => {
    const { id } = req.params;

    if (id) {
        try {
            let payload = {
                user: id,
                owner: req.user.id
            }
            let data = await db.delete2('block', {
                conditions: [
                    ['user', '=', id],
                    ['owner', '=', req.user.id]
                ]
            });
            if (data) {
                socket.send([id, req.user.id], 'unblock', payload);
                return res.send({
                    status: '200',
                    message: 'OK',
                    data: data
                })
            } else {
                return res.send({
                    status: '404',
                    message: 'User not found',
                    data: null
                })
            }
        } catch (error) {
            console.log(error)
            return res.send({
                status: '500',
                message: 'Internal Server Error',
                data: null
            })
        }
    } else {
        return res.send({
            status: '400',
            message: 'Bad Request (id is empty)',
            data: null
        })
    }
}

exports.deletePost = async (req, res) => {
    let { id } = req.params;
    let user_id = req.user.id;

    try {
        let post = await db.select('post', {
            fields: ['owner'],
            conditions: [
                ['id', '=', id]
            ]
        })
        if (post[0].owner == user_id) {
            await db.delete2('post', {
                conditions: [
                    ['id', '=', id]
                ]
            })
            return res.send({
                status: '200',
                message: 'OK',
                data: null
            })
        } else {
            return res.send({
                status: '401',
                message: 'Unauthorized',
                data: null
            })
        }
    } catch (error) {
        console.log(error)
        return res.send({
            status: '500',
            message: 'Internal Server Error',
            data: null
        })
    }
}

exports.respondCollab = async (req, res) => {
    let { id, type} = req.params;

    if(!id || !type) {
        return res.send({
            status: '400',
            message: 'Bad Request (id or type is empty)',
            data: null
        })
    }

    try {
        let acc = await db.select('activity', {
            fields: ['*'],
            conditions: [
                ['post', '=', id],
                ['type', '=', NotificationType.collabRequest],
                ['owner', '=', req.user.id]
            ]
        })

        if(acc.length == 0) {
            return res.status(404).send({
                status: '404',
                message: 'Collab request not found',
                data: null
            })
        }
        let pos = await db.select('post', {
            fields: ['*'],
            conditions: [
                ['id', '=', id]
            ]
        })

        if(pos.length == 0) {
            return res.status(404).send({
                status: '404',
                message: 'Post not found',
                data: null
            })
        }
        let post = pos[0];

        switch(type){
            case 'accept':
                let collabs = post.collabs || []
                if(collabs.indexOf(req.user.id) == -1) {
                    collabs.push(req.user.id)
                }
                await db.update('post',{
                    fields: {
                        collabs
                    },
                    conditions: [
                        ['id', '=', id]
                    ]
                })
                await notification.notify(req, post.owner, NotificationType.collabAccepted, {
                    post: id,
                    sender: req.user.id
                })
                break;
            case 'decline':
                await notification.notify(req, post.owner, NotificationType.collabDeclined, {
                    post: id,
                    sender: req.user.id
                })
                break;
        }
        await db.delete2('activity', {
            conditions: [
                ['post', '=', id],
                ['type', '=', NotificationType.collabRequest],
                ['owner', '=', req.user.id]
            ]
        })
        return res.send({
            status: '200',
            message: 'OK'
        });       
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: '500',
            message: 'Internal Server Error',
            data: null
        })
    }
}

exports.revokeCollab = async (req, res) => {}