const multer =  require("multer");
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const multerS3 = require('multer-s3');


aws.config.update({
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY', //Replace with Secret Access Key from AWS
    accessKeyId: 'AWS_ACCESS_KEY_ID', //Replace with Secret Access Key ID 
    region: 'us-west-1'
});
const s3 = new aws.S3();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"./uploads");
    },
    filename: function (req, file, cb){
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 189)
        cb(null, file.originalname+"-"+uniqueSuffix)
    }
});

const s3storage = multerS3({
    s3: s3,
    bucket: 'YOUR_S3_BUCKET_NAME', //replace with your bucket name
    key: function (req, file, cb) {
        //console.log(file);
        cb(null, file.originalname); //use Date.now() for unique file keys
    }
})
const upload = multer({ storage: s3storage})
upload.s3 = s3
module.exports = upload