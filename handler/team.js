const db = require('../service/postgres.js');

exports.team = async (req, res) => {
    let team = req.body;

    try {
        let payload = {
            id: team.id,
            name: team.name,
            code: team.code,
            data: team.data,
            owner: team.owner,
            updated_at: team.updated_at,
        }
        if(req.update){
            await db.update('team', {
                fields: payload,
                conditions: [
                    ['id', '=', team.id]
                ]
            })
        } else {
            let result = await db.insert('team', payload, 'id')
            team.id = result[0].id;
        }
        let members = team.members;

        for(let i = 0; i < members.length; i++){
            let member = members[i];
            let payload = {
                team: team.id,
                account: member.id,
                owner: team.owner,
            }
            try {
                await db.insert('team_account', payload);
            } catch (e) {
                
            }
        }
        res.status(200).send(
            {
                status: '200',
                message: 'OK',
                data: team
            }
        )
    
    } catch (e) {
        console.log(e);
        res.status(500).send(
            {
                status: '500',
                message: 'Internal server error'
            }
        )
    }
}

exports.getTeams = async (req, res) => {
    try {
        let result = await db.select('team_view', {
            fields: ['*'],
            conditions: []
        });
        res.status(200).send(
            {
                status: '200',
                message: 'OK',
                data: result
            }
        )
    } catch (e) {
        console.log(e);
        res.status(500).send(
            {
                status: '500',
                message: 'Internal server error',
                error: e.message
            }
        )
    }
}

exports.siteAccounts = async (req, res) => {
    try {
        let result = await db.select('account', {
            fields: ['*'],
            conditions: []
        });
        res.status(200).send(
            {
                status: '200',
                message: 'OK',
                data: result
            }
        )
    } catch (e) {
        console.log(e);
        res.status(500).send(
            {
                status: '500',
                message: 'Internal server error',
                error: e.message
            })
    }
}