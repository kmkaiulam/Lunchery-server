'use strict';
exports.DATABASE_URL = 'mongodb://localhost/lunchery' || process.env.DATABASE_URL 
exports.TEST_DATABASE_URL = 'mongodb://localhost/lunchery-test' || process.env.TEST_DATABASE_URL 
exports.PORT = process.env.PORT;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY;
exports.S3_BUCKET_NAME=process.env.S3_BUCKET_NAME;
exports.AWS_ACCESS_KEY=process.env.AWS_ACCESS_KEY;
exports.AWS_REGION=process.env.AWS_REGION;
exports.AWS_Uploaded_File_URL_LINK=process.env.AWS_Uploaded_File_URL_LINK;
exports.AWS_USER_ARN=process.env.AWS_USER_ARN;