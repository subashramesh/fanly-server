const db = require('../service/chat/postgres')
const { CoinTrasactionType } = require('../consts/enums.js')

async function transact(value, type, user, owner, post) {
    if (value != null) {
        let r = await db.insert('coin_transaction', {
            owner: owner,
            value: value,
            type: type,
            user: user,
            post: post
        }, 'id')
        console.log(r)
        return r;
    }
}

exports.getCoinBalance = async (req, res) => {
    try {
        let result = await db.select('coin_transaction', {
            conditions: [
                ['owner', '=', req.user.id]
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
                ['owner', '=', req.user.id]
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
    var result;
    const { num } = req.query;
    var number = num;
    console.log(number);
    const query = `SELECT 
      a.*,
      ct.total_value
  FROM 
      (SELECT 
           owner, 
           SUM(value) AS total_value
       FROM 
           coin_transaction
       WHERE 
           created_at >= CURRENT_DATE 
           AND created_at < CURRENT_DATE + INTERVAL '1 day'
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

    const query1 = `SELECT 
      a.*,
      ct.total_value
  FROM 
      (SELECT 
           owner, 
           SUM(value) AS total_value
       FROM 
           coin_transaction
       WHERE 
           created_at >= date_trunc('week', CURRENT_DATE)  -- Start of the current week
           AND created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'  -- Start of next week
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

    const query2 = `SELECT 
      a.*,
      ct.total_value
  FROM 
      (SELECT 
           owner, 
           SUM(value) AS total_value
       FROM 
           coin_transaction
       WHERE 
           created_at >= date_trunc('month', CURRENT_DATE)  -- Start of the current month
           AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'  -- Start of next month
       GROUP BY 
           owner
       ORDER BY 
           total_value DESC
       LIMIT 15) ct
  JOIN 
      account a ON ct.owner = a.id
  ORDER BY 
      ct.total_value DESC;
  `

    if (number == 0) {
        result = await db.knex.raw(query);
    } else if (number == 1) {
        result = await db.knex.raw(query1);
    } else if (number == 2) {
        result = await db.knex.raw(query2);
    } else {
        return res.json({
            'message': 'invalid Number'
        })
    }

    if (result.rowCount <= 0) {
        return res.json({
            'message': 'No data found'
        })
    } else {
        return res.json(result.rows);

    }
}

exports.transact = transact