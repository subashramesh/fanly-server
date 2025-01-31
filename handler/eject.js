const db = require('../service/chat/postgres');

exports.eject = async (req, res) => {
    let id = req.params.id;

    try {
        await db.delete2('pushkit', {
            conditions: [
                ['user', '=', id]
            ]
        })
        await db.delete2('post', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('comment', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('like', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('follow', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('follow', {
            conditions: [
                ['user', '=', id]
            ]
        })
        await db.delete2('activity', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('activity', {
            conditions: [
                ['sender', '=', id]
            ]
        })
        await db.delete2('call', {
            conditions: [
                ['caller', '=', id]
            ]
        })
        await db.delete2('call', {
            conditions: [
                ['receiver', '=', id]
            ]
        })
        await db.delete2('group_member', {
            conditions: [
                ['user', '=', id]
            ]
        })
        await db.delete2('group_admin', {
            conditions: [
                ['user', '=', id]
            ]
        })
        await db.delete2('account', {
            conditions: [
                ['id', '=', id]
            ]
        })
        await db.delete2('device', {
            conditions: [
                ['owner', '=', id]
            ]
        })
        await db.delete2('fcm', {
            conditions: [
                ['user', '=', id]
            ]
        })
        await db.delete2('contact', {
            conditions: [
                ['user', '=', id]
            ]
        })
        await db.delete2('contact_user', {
            conditions: [
                ['user', '=', id]
            ]
        })
        res.status(200).send({
            message: 'Ejection successful',
            status: '200'
        });
    } catch (err) {
        console.error(`Error ejecting ${id}: ${err}`);
        res.status(500).send({
            message: `Error ejecting ${id}`,
            status: '500'
        });

    }
}

exports.getDeleted = async (req, res) => {
    let ids = req.body.ids;
    try{
        let result = await db.select('account', {
            fields: ['id'],
            conditions: [
                ['id', 'in', ids]
            ]
        });
        let available = result.map(e => e.id);
        let deleted = ids.filter(e => !available.includes(e));
        res.status(200).send({
            message: 'Deleted accounts fetched',
            status: '200',
            data: deleted
        });

    } catch(e){
        console.log(e)
        res.status(500).send({
            message: `Error getting deleted ${ids}, ${e}`,
            status: '500'
        });
    }
}