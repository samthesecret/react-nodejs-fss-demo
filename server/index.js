const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = require("./upload");
const bodyParser = require('body-parser');
const app = express();

const whitelist = ["http://localhost:3000"];
const corsOptions = {
    origin: function (origin, callback){
        if(!origin || whitelist.indexOf(origin) !== -1){
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
app.post("/upload_file",upload.single("file"), async function(req, res){
    if(!req.file){
        throw Error("FILE_MISSING");
    } else {
        console.log(req.file);
        var responseStatus = 0;
        var params = {
            Bucket: 'YOUR_S3_BUCKET_NAME', //replace with your bucket name
            Key: req.file.key
        }; 
        var countCheck = 0;
        while(true){

            await sleep(1000);
            let metaData = await upload.s3.getObjectTagging(params).promise();
            console.log(metaData);
            var scanned_completed = metaData.TagSet.filter(function (o) {
                return o.hasOwnProperty('Key') && o['Key']=='fss-scanned';
            });
            if(scanned_completed.length >0){
                if(scanned_completed[0].Value == 'true'){
                    var scanned_result = metaData.TagSet.filter(function (o) {
                        return o.hasOwnProperty('Key') && o['Key']=='fss-scan-result';
                    });
                    if (scanned_result[0].Value == 'no issues found'){
                        //res.send({ status:"success"});
                        //responseSent = true;
                        responseStatus = 1;
                    }else if (scanned_result[0].Value == 'malicious'){
                        //res.statusCode = 400
                        //res.send({code: "FILE_MALICIOUS" }); 
                        //responseSent = true;
                        responseStatus = 2;
                    }
                }
            }
            countCheck++;
            console.log(countCheck); // mostly demostrative
            if(countCheck===3) break;
        }

        if(responseStatus == 1) {
            res.send({ status:"success"}); 
        }else if(responseStatus == 2) {
            res.statusCode = 400;
            res.send({code: "FILE_MALICIOUS"});  
        }else {
            res.statusCode = 500;
            res.send({code: "GENERIC_ERROR"});  
        }
    }
});

app.use(function(err,req,res,next){
    if(err instanceof multer.MulterError){
        res.statusCode = 400
        res.send({code: err.code });
    } else if(err){
        if (err.message === "FILE_MISSING"){
            res.statusCode = 400
            res.send({code: "FILE_MISSING" });    
        } else {
            console.log({err});
            res.statusCode = 500
            res.send({code: "GENERIC_ERROR", err: {err} });    
        }
    }
});

const server = app.listen(8081,function(){
    console.log("Server start at 8081")
});