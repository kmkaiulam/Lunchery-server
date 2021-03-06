'use strict';
exports.DATABASE_URL= process.env.DATABASE_URL || 'mongodb://localhost/lunchery' 
exports.TEST_DATABASE_URL=process.env.TEST_DATABASE_URL || 'mongodb://localhost/lunchery-test'  
exports.PORT=process.env.PORT;
exports.JWT_SECRET=process.env.JWT_SECRET;
exports.JWT_EXPIRY=process.env.JWT_EXPIRY;
exports.S3_BUCKET_NAME=process.env.S3_BUCKET_NAME;
exports.AWS_ACCESS_KEY=process.env.AWS_ACCESS_KEY;
exports.AWS_Uploaded_File_URL_LINK=process.env.AWS_Uploaded_File_URL_LINK;
exports.AWS_USER_ARN=process.env.AWS_USER_ARN;