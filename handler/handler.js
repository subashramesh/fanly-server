const db = require('../service/postgres.js');
const awsS3 = require('../service/aws_s3.js');
const qikberry = require('../service/qikberry/qikberry.js');
const auth = require('../middleware/auth')

exports.test = async (req, res) => {
    try {
        const result = await db.select('account');
        const token = auth.generateToken({result}, '1h')
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: token
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error',
            error: e
        });
    }
}

exports.upload = async (req, res) => {
    await awsS3(req)
    .then(data => {
      res.status(200).json({
        status: '200',
        message: "Success",
        data
      })
    })
    .catch(error => {
        console.log(error);
      res.status(400).json({
        message: "An error occurred.",
        error
      })
    })
  };

  exports.testOTP = async (req, res) => {
    let s = await qikberry.sendOTP('123456', '+917200142499');
    res.status(200).json({
        status: '200',
        message: 'Success',
        data: s
    });
  }