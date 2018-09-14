'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {Announcement} = require('../models');
const {jwtAuth} = require('../auth')
const {checkValidUser, checkRequiredFields} = require('../middleware/validation')
mongoose.Promise = global.Promise;

// --- Common Functions ---
function populateAnnouncements(){
   return  Announcement.find().populate({
        path: 'createdBy', 
        select: 'username _id' 
    })  
};

function populateNewAnnouncement(post){
    return  Announcement.findById(post._id).populate({
         path: 'createdBy', 
         select: 'username _id' 
     }) 
}; 


// --- GET ---
//GET request
router.get('/', (req, res) => {
    populateAnnouncements()
    .then(populatedPosts =>{
    res.json(populatedPosts)
    })
    .catch(err => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
    }); 
});

      
// --- POST ---
router.post('/', jwtAuth, checkRequiredFields, (req, res) =>{
    Announcement
        .create({
             posttype: req.body.posttype,
             text: req.body.text,
             created: req.body.created,
             createdBy: req.user.id 
        })
        .then(post => {
           return populateNewAnnouncement(post)
            })
        .then(populatedAnnouncement => {
            res.status(201).json(populatedAnnouncement);
        })
        .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
        }); 
});
           


// --- PUT ---
router.put('/:id', jwtAuth, checkValidUser, checkRequiredFields, (req, res) =>{
    console.log(`Updating bandpost entry \`${req.params.id}\``);
    const toUpdate = {};
    const updateableFields = ['text']; 

    updateableFields.forEach(field => {
        if (field in req.body){
            toUpdate[field] = req.body[field];
        }
    })
    //Add modified date to post 
    toUpdate.modified = Date.now();

    Announcement
            .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
            .then(announcement => {
            return populateNewAnnouncement(announcement);
            })
            .then(populatedAnnouncement => {
                res.status(200).send(populatedAnnouncement)
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            })
    });



// --- DELETE ---
router.delete('/:id', jwtAuth, checkValidUser, checkRequiredFields, (req,res) => {
    console.log(`Deleting bandpost entry \`${req.params.id}\``);
   
    Announcement
        .findByIdAndRemove(req.params.id)
        .then(Announcement => {
            res.status(204).end();
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});
           
module.exports = {router};