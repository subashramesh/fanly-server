require('dotenv').config();
const db = require('../service/chat/postgres')
const router = require('express').Router()

let preview = async (req, res) => {
    console.log('preview')

    let q = req.query.id

    if (q) {
        let posts = await db.select('post', {
            fields: ['*'],
            conditions: [
                ['id', '=', q]
            ]
        })

        if (posts.length == 0) {
            return res.status(404).send({
                status: '404',
                message: 'Not Found'
            })
        } else {
            let post = posts[0]
            let contents = await db.select('media', {
                fields: ['*'],
                conditions: [
                    ['post', '=', post.id]
                ]
            })

            let accounts = await db.select('account', {
                fields: ['*'],
                conditions: [
                    ['id', '=', post.owner]
                ]
            })

            if (accounts.length > 0) {
                post.owner = accounts[0]
            }

            if (contents.length > 0 && accounts.length > 0) {
                console.log(contents)
                console.log(accounts)
                console.log(posts)

                let content = contents[0]
                let account = accounts[0]

                // send a html response to request to display the thumbnail

                return res.render('post', {
                    title: 'Post by ' + `${account.dname}`,
                    description: post.metadata.desc,
                    image: content.content.thumbnail || content.content.main,
                });

            }

            return res.send({
                status: '200',
                message: 'Success',
                data: post
            })
        }

        return res.send({
            status: '200',
            message: 'Success',
            data: post
        })
    } else {
        return res.status(400).send({
            status: '400',
            message: 'Bad Request'
        })
    }

    res.send({
        status: '200',
        message: 'Success',
        data: req.body
    })
}

router.get('/post', preview)

exports.router = router