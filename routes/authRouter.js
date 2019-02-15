'use strict';
// --- MODULES ---
const express = require('express');

// --- IMPORTS --- 
const router = express.Router();
const authCtrl = require('../controllers/authCtrl');

// --- MIDDLEWARE --- 
const {localAuth, jwtAuth} = require('../middleware/auth');

//Create a New User
router.post('/login', localAuth, authCtrl.login) 

//Refresh AuthToken 
router.post('/refresh', jwtAuth, authCtrl.refresh)

module.exports = {router};
