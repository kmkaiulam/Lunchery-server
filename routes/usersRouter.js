'use strict';
require("dotenv").config();
// --- MODULES ---
const express = require('express');

// --- IMPORTS ---
const router = express.Router();
const usersCtrl = require('../controllers/usersCtrl');

// --- MIDDLEWARE ---
const {jwtAuth} = require('../middleware/auth');
const {uploader} = require ('../middleware/multer')
const {checkUserRequiredFields, checkUserStringFields, checkUserTrimmedFields, checkUserSizedFields} = require('../middleware/userCheck');


//GET a User by ID
router.get('/:id', jwtAuth, usersCtrl.findById); 

//Post to register a new user
router.post('/', checkUserRequiredFields, checkUserStringFields, checkUserTrimmedFields, checkUserSizedFields, usersCtrl.createNewUser);
  
//Profile Update
router.put('/:id', jwtAuth, usersCtrl.profileUpdate); 
  
//Profile Image Update                    
router.put('/profileImage/:id', jwtAuth, uploader.profileImage, usersCtrl.profileImageUpdate);

module.exports = {router};