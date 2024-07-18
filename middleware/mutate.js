exports.mutate = async (req, res, next) => {
    let body = req.body;

    try {
        if(body.id) {
            req.update = true;
            body.updated_at = new Date();
        } else {
            delete body['id']
            delete body['created_at']
            body.owner = req.user.id;
            req.update = false;
        }
        req.body = body;
        next();
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error',
            error: e.message
        });
    }
}