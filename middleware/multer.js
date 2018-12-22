require("dotenv").config();
// --- IMPORTS ---
const AWS = require ('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const shortid = require('shortid');
// --- EXPORTS ---
const uploader = {};

// AWS PROFILE IMAGE STORING
const s3= new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET_NAME
  })
  
  const profileImgUpload= multer({ 
    storage: multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET_NAME,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const ext = file.originalname.match(/\.\w*/g)[0];
        const uniqueId = shortid.generate();
       cb(null,'user-images/' + file.fieldname + '-' + uniqueId + ext);
      }
     }), 
     fileFilter: function( req, file, cb ){
      checkFileType( file, cb );
     }
  })
  
  
  
  function checkFileType( file, cb ){
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
      const mimetype = filetypes.test( file.mimetype );
      if( mimetype && extname ){
        return cb( null, true );
      } else {
        cb( 'Error: Images Only!' );
      }
  }


uploader.profileImage = profileImgUpload.single('profileImage');



module.exports = { uploader };