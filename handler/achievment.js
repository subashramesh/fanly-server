const db = require('../service/chat/postgres')
const { Achievement } = require('../consts/enums.js')

exports.addAchievement = async (dimension, owner) => {
    console.log(`${dimension}: ${owner}`)
    let result = await db.insert('account_achievement', {
        owner: owner,
        dimension: dimension,
        value: 1
    }, 'id')

    return result;
}

exports.getAchievements = async (req, res) => {
    try{
        let result = await db.select('account_achievement', {
            conditions: [
                ['owner', '=', req.user.id]
            ],
            fields: ['*'],
        })

        let master = await db.select('achievement', {
            fields: ['*'],
            conditions: []
        })

        return res.send({
            status: '200',
            message: 'Success',
            data: result,
            secondary: master
        })
    } catch (e){
        console.log(e)
        return res.send({
            status: '500',
            message: 'Error getting achievements'
        })
    }
}
