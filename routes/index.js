'use strict';
// --- IMPORTS --- 
const {router: groupsRouter} = require('./groupsRouter'); 
const {router: usersRouter} = require('./usersRouter');
const {router: authRouter} = require('./authRouter');

module.exports = {groupsRouter, usersRouter, authRouter};