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
                    let r = await db.fun('get_user', {
                        params: `${req.user.id},${id}`
                    });
                    if (r.length > 0) {
                        let d = r[0]['get_user']
                        if (d) {
                            result.push(d);
                        }

                    }
                }
                break;
            case 'tags':
                var posts = await db.knex.raw(`
    SELECT DISTINCT jsonb_array_elements_text(metadata->'tags') AS tag
    FROM post
    WHERE EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(metadata->'tags') AS tag
        WHERE tag ILIKE '%${query}%'
    )
`);
                posts = posts.rows;
                let tags = [];
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i];
                    let tag = post.tag.split('\n');
                        if (tag) {
                            for (let j = 0; j < tag.length; j++) {
                                if (tag[j].toLowerCase().includes(query.toLowerCase())) {
                                    tags.push(tag[j]);
                                }
                            }
                        }

                }
                //unique tags
                result = [...new Set(tags)];
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