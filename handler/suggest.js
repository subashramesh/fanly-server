const db = require('../service/chat/postgres');


exports.suggest = async (req, res) => {
    try {
        let user = req.user.id;
        let con = await db.select('contact', {
            fields: ['*'],
            conditions: [
                ['user', '=', user]
            ]
        })
        let phones = con.map((e) => e.phone)
        
        let acc = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['normalized', 'in', phones],
                ['uname', '!=', '']
            ]
        })

        let following = [], followers = [], contacts = [];

        let contects = await db.select('follow', {
            fields: ['*'],
            conditions: [
                ['user', '=', user]
            ],
            orWhere: [
                ['owner', '=', user]
            ]
        })

        for(let i = 0; i < contects.length; i++) {
            let e = contects[i];
            if(e.owner == user) {
                following.push(e.user)
            } else {
                followers.push(e.owner)
            }
        }

        for(let i = 0; i < acc.length; i++) {
            let e = acc[i];
            contacts.push(e.id)
        }

        let inputs = []

        // push all elements three arrays into inputs
        inputs.push(...following)
        inputs.push(...followers)
        inputs.push(...contacts)

        // remove own id from inputs
        for(let i = 0; i < inputs.length; i++) {
            if(inputs[i] == user) {
                inputs.splice(i, 1)
                i--;
            }
        }

        let ids = '';
        for(let i = 0; i < inputs.length; i++) {
            ids += `${inputs[i]}`
            if(i < inputs.length - 1) {
                ids += ','
            }
        }
        let params = `'${user}', '{${ids}}'::bigint[]`
        let rrr = await db.fun('get_users', {
            params: params
        });
        let d = rrr[0]['get_users']
        // remove where following is true in for loop
        for(let i = 0; i < d.length; i++) {
            let e = d[i];
            if(e.im_following == true) {
                d.splice(i, 1)
                i--;
            }
        }

        res.status(200).json({
            status: '200',
            message: 'Success',
            data: d
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: `Internal Server Error: ${e}`
        });
    }
}