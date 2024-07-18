exports.response = async (req, res, next) => {
    try {
        let result = await next();
        if(result === undefined) return;
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        });
    } catch (e) {
        console.log(e);
        return Error(e);
    }
}