// --- MODULES ---
require('dotenv').config()
const express = require('express');

// --- IMPORTS ---
const router = express.Router();
const groupsCtrl = require('../controllers/groupsCtrl');

// --- MIDDLEWARE ---
const {jwtAuth} = require('../middleware/auth');

//GROUPS SEARCH
router.get('/', groupsCtrl.searchGroups);  

//CREATE A GROUP
router.post('/', jwtAuth, groupsCtrl.createGroup);

//EDIT GROUP
router.put('/:id', jwtAuth, groupsCtrl.editGroup);

//DELETE GROUP
router.delete('/:id', jwtAuth, groupsCtrl.deleteGroup);
  
//JOIN A GROUP
router.post('/members/:id', jwtAuth, groupsCtrl.joinGroup);

//LEAVE A GROUP
router.delete('/members/:id', jwtAuth, groupsCtrl.leaveGroup);

module.exports = {router};