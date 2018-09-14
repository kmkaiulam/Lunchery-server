'use strict';
// --- MODULES ---
const express = require('express');
// --- IMPORTS ---
const {User} = require('../models');
const router = express.Router();
const {checkUserRequiredFields, checkUserStringFields, checkUserTrimmedFields, checkUserSizedFields} = require('../middleware/userCheck');


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

module.exports = {router};