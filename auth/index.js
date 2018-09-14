'use strict';
const {router: authRouter} = require('./authRouter');
const {localStrategy, jwtStrategy, jwtAuth} = require('./strategies');
module.exports = {authRouter, localStrategy, jwtStrategy, jwtAuth};