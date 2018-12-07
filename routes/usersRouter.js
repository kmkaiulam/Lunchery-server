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

//chefs search route
router.get('/chefs', jwtAuth, (req,res) => {
  return User.find({'chef': true})
    .then(chefs =>{
      console.log(chefs)
      res.json(chefs)
    })
    .catch(err =>{
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
})

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




module.exports = {router};