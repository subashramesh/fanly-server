const mongobj = new mongoDB();

exports.getUsers = async (req, res) => {
    const ids = req.body.ids;
    const mails = req.body.mails;
    const phones = req.body.phones;
    const query = {};
    
    try{
        if(ids){
            query.UserId = { $in: ids }
        }
        if(mails){
            query.Email = { $in: mails }
        }
        if(phones){
            query.MobileNo = { $in: phones}
        }
        
        mongobj.getUsers(query, (error, data) => {
            if(error){
                res.status(500).json({
                    'status': '500',
                    'message': `Database error: ${error}`
                })
            }
            res.send({
                'status': '200',
                'message': 'fetched',
                'data': data
            })
        })
    } catch(e){
        res.status(500).json({
            'status': '500',
            'message': 'Internal server error',
            'error': e.message
        })
    }
}