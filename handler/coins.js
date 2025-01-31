const db = require('../service/chat/postgres')
const { CoinTrasactionType } = require('../consts/enums.js')

async function transact(value, type, user, owner, post, star) {
    if (value != null) {
        let r = await db.insert('coin_transaction', {
            owner: owner,
            value: value,
            type: type,
            user: user,
            post: post,
            star: star
        }, 'id')
        return r;
    }
}

async function refrain(type, user, owner, post) {
    await db.delete2('coin_transaction', {
        conditions: [
            ['user', '=', user],
            ['owner', '=', owner],
            ['type', '=', type],
            ['post', '=', post]
        ],
    })
    return;
}

exports.getCoinBalance = async (req, res) => {
    try {
        let result = await db.select('coin_transaction', {
            conditions: [
                ['owner', '=', req.user.id],
                ['star' , '=', req.user.star]
            ],
            fields: ['*'],
        })

        var balance = 0;

        result.forEach(e => {
            balance += e.value;
        });

        return res.send({
            status: '200',
            message: 'Success',
            data: balance
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Error getting coins'
        })
    }
}

exports.getCoinHistory = async (req, res) => {
    try {
        let result = await db.select('coin_transaction', {
            conditions: [
                ['owner', '=', req.user.id],
                ['star' , '=', req.user.star]
            ],
            fields: ['*'],
            orderBy: 'created_at',
            order: 'desc'
        });

        return res.send({
            status: '200',
            message: 'Success',
            data: result
        })
    } catch (e) {
        console.log(e)
        return res.send({
            status: '500',
            message: 'Error getting coins'
        })
    }
}

exports.getRanking = async (req, res) => {  
    const { num } = req.query;
    const number = parseInt(num, 10);
    let star = req.user.star;

    let interval = '';
    let startDateCondition = '';

    if (number === 0) {
        interval = '1 day';
        startDateCondition = `created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '${interval}'`;
    } else if (number === 1) {
        interval = '1 week';
        startDateCondition = `created_at >= date_trunc('week', CURRENT_DATE) AND created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '${interval}'`;
    } else if (number === 2) {
        interval = '1 month';
        startDateCondition = `created_at >= date_trunc('month', CURRENT_DATE) AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '${interval}'`;
    } else {
        return res.json({ message: 'Invalid number' });
    }

    const query = `
        SELECT 
            a.*,
            ct.total_value
        FROM 
            (SELECT 
                 owner, 
                 SUM(value) AS total_value
             FROM 
                 coin_transaction
             WHERE 
                 ${startDateCondition}
                 AND star = ${star}
             GROUP BY 
                 owner
             ORDER BY 
                 total_value DESC
             LIMIT 15) ct
        JOIN 
            account a ON ct.owner = a.id
        ORDER BY 
            ct.total_value DESC;
    `;

    try {
        const result = await db.knex.raw(query);
        if (result.rowCount <= 0) {
            return res.json({ message: 'No data found' });
        }
        return res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.transact = transact
exports.refrain = refrain