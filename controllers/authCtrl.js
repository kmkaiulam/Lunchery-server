'use strict';
// --- MODULES --- 
const jwt = require('jsonwebtoken');

// --- IMPORTS --- 
const {JWT_SECRET, JWT_EXPIRY} = require('../config');

// --- EXPORTS --- 
const authCtrl = {};


const createAuthToken = function(user){
    return jwt.sign({user}, JWT_SECRET, {
      subject: user.username,
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256'
    });
};

authCtrl.login = function(req, res) {
    const authToken = createAuthToken(req.user.serialize());
    res.status(200).json({ code: 201, message: 'Success', authToken: authToken });
}

authCtrl.refresh = authCtrl.login;

module.exports = authCtrl;