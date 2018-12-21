'use strict';
require("dotenv").config();
// --- MODULES ---
const express = require('express');
const AWS = require ('aws-sdk');

// --- IMPORTS ---
const {User} = require('../models');
const {jwtAuth} = require('../auth');
const {uploader} = require ('../middleware/multer')
const router = express.Router();
const {checkUserRequiredFields, checkUserStringFields, checkUserTrimmedFields, checkUserSizedFields} = require('../middleware/userCheck');


router.get('/:id', jwtAuth, (req,res) => {
  return User.findById(req.params.id)
    .then(user => res.json(user.serialize()))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


// Post to register a new user
router.post('/', checkUserRequiredFields, checkUserStringFields, checkUserTrimmedFields, checkUserSizedFields, (req, res) =>{
  let {username, password, chef, firstName = '', lastName = ''} = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();
  
  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        })
      }
      return User.hashPassword(password);
     })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName,
        chef
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      console.log(err);
      if (err.reason === 'ValidationError'){
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

// Profile Update
router.put('/:id', jwtAuth, (req, res) => {
  let id= req.params.id;
  let toUpdate = {};
  const updateableFields = ['displayName', 'company', 'location', 'style', 'picture', 'bio']
  
  updateableFields.forEach(field => {
    if (field in req.body.profile) {
      toUpdate[`chefProfile.${field}`] = req.body.profile[field];
    }
  })
  User.findByIdAndUpdate(id, {$set: toUpdate}, {new:true})
  .then(user => {
    console.log(user.serialize());
    res.status(200).json(user)
  })
  .catch(error => {
    console.log(error)
    res.status(500).json({code: 500, message: 'Internal server error'});
  })
});

//Profile Image Update                      profileImgUpload.single('profileImage)
router.put('/profileImage/:id', jwtAuth, uploader.profileImage, ( req, res ) => {
  const userId = req.user.id;
  return User.findById(userId)
  .then(user => {
    let profileImageLink = user.chefProfile.profileImage;
   
    if (user.chefProfile.profileImage !== 'default-user-image.png') {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const s3 = new AWS.S3()
    const myBucket = process.env.S3_BUCKET_NAME;

    let params = {
      Bucket: myBucket, 
      Key: profileImageLink
    };
    console.log(req.file)
    console.log(req.file.key)
    console.log(params.Key)
    
    return s3.deleteObject(params).promise()
    .then(function(data) {
      if (data) {
        console.log(`deleting ${params.Key}`)
        return User.findByIdAndUpdate(userId, {$set: {'chefProfile.profileImage':req.file.key}}, { new: true })
        .then(user => {
          res.status(201).json(user.serialize());
        })
        .catch(err => {
          res.status(500).json({
            code: 500,
            message: 'Database Error'
          })
        })
      }
    })
  }

  return User.findByIdAndUpdate(userId, {$set: {'chefProfile.profileImage':req.file.key}}, { new: true })
  .then(user => {
  res.status(201).json(user.serialize());
  })
  .catch(err => {
    res.status(500).json({
      code: 500,
      message: 'Database Error'
    })
  })
});
});


  


     
 

module.exports = {router};