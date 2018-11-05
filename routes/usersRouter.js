'use strict';
// --- MODULES ---
const express = require('express');
// --- IMPORTS ---
const {User} = require('../models');
const router = express.Router();
const {checkUserRequiredFields, checkUserStringFields, checkUserTrimmedFields, checkUserSizedFields} = require('../middleware/userCheck');
const {jwtAuth} = require('../auth');
// router.get('/', (req, res) => {
//   return User.find()
//     .then(users => res.json(users.map(user => user.serialize())))
//     .catch(err => res.status(500).json({message: 'Internal server error'}));
// });

router.get('/:id', jwtAuth, (req,res) => {
  return User.findById(req.params.id)
    .then(user => res.json(user.serialize()))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


// Post to register a new user
router.post('/', checkUserRequiredFields, checkUserStringFields, checkUserTrimmedFields, checkUserSizedFields, (req, res) =>{
  let {username, password, firstName = '', lastName = ''} = req.body;
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
        lastName
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
  console.log(id);
  let toUpdate = {};
  const availabilityUpdate = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'mondayLimit', 'tuesdayLimit', 'wednesdayLimit', 'thursdayLimit', 'fridayLimit']  
  const updateableFields = ['displayName', 'company', 'style', 'picture', 'signatureDish']
  
  updateableFields.forEach(field => {
    if (field in req.body.profile) {
      toUpdate[`chefProfile.${field}`] = req.body.profile[field];
    }
  })
  
  availabilityUpdate.forEach(field => {
    if (field in req.body.profile) {
      toUpdate[`chefProfile.availability.${field}`] = req.body.profile[field]
    }
  })
  console.log('--------------------------');
  console.log(toUpdate);
  console.log(req.body);
  console.log('--------------------------');
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




module.exports = {router};