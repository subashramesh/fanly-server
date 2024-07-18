require('dotenv').config();
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");
const formidable = require('formidable');
const Transform = require('stream').Transform;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;

const parsefile = async (req) => {
    console.log(accessKeyId, secretAccessKey, region, Bucket)
    return new Promise((resolve, reject) => {
        let options = {
            maxFileSize: 100 * 1024 * 1024, //100 MBs converted to bytes,
            allowEmptyFiles: false
        }

        const form = new formidable.Formidable(options);
        
        form.parse(req, (err, fields, files) => {});

        form.on('error', error => {
            console.log(error);
            reject(error.message)
        })
        
        form.on('data', data => {
            console.log(data)
            if (data.name === "complete") {
                resolve(data.value);
            }
        })
        
        form.on('fileBegin', (formName, file) => {
            console.log(formName)
            file.open = async function () {
                this._writeStream = new Transform({
                    transform(chunk, encoding, callback) {
                        callback(null, chunk)
                    }
                })

                this._writeStream.on('error', e => {
                    form.emit('error', e)
                });
                let ii = (req.user || {}).id || 'public';
                // upload to S3
                new Upload({
                    client: new S3Client({
                        credentials: {
                            accessKeyId,
                            secretAccessKey
                        },
                        region
                    }),
                    params: {
                        ACL: 'public-read',
                        Bucket,
                        Key: `Upload-2023/${ii}/${Date.now().toString()}-${this.originalFilename}`,
                        Body: this._writeStream
                    },
                    tags: [], // optional tags
                    queueSize: 4, // optional concurrency configuration
                    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
                    leavePartsOnError: false, // optional manually handle dropped parts
                })
                    .done()
                    .then(data => {
                        // https://s3.ap-south-1.amazonaws.com/space.focus.ind.in/Upload-2023/Test-Ragu.jpg
                        //https://space.timesmed.in/
                        // data.Location = 'https://s3.ap-south-1.amazonaws.com/' + Bucket + '/' + data.Key;

                        // data.Location = 'https://space.timesmed.in/' + data.Key; // BEFORE
                        // data.Location = 'https://space.focus.ind.in/cached/' + data.Key; // AFTER
                        //https://dgw26q7c6up2.cloudfront.net
                        // data.Location = 'https://dgw26q7c6up2.cloudfront.net/' + data.Key;
                        data.Location = 'https://clips.focus.ind.in/' + data.Key;

                        form.emit('data', { name: "complete", value: data });
                    }).catch((err) => {
                        console.log(err);
                        form.emit('error', err);
                    })
            }

        })

        
    })
}

module.exports = parsefile;