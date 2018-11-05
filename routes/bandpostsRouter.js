/* 'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const {jwtAuth} = require('../auth')
const {checkValidUser, checkRequiredFields} = require('../middleware/validation')
const {Bandpost} = require('../models');
mongoose.Promise = global.Promise;

// --- Common Functions ---
function populateBandpost(post){
    return Bandpost.findById(post._id).populate({
            path: 'createdBy', 
            select: 'username _id' 
    })
            .populate({
                path: 'replies.createdBy', 
                select: 'username _id' 
    })
};
      
// --- Bandposts ---
    // --- GET ---  
        //Display Events    
router.get('/events', (req, res) => {
    Bandpost
        .find({'posttype': 'Event_Eval'})
        .populate({
            path: 'createdBy', 
            select: 'username _id' 
        })
        .populate({
            path: 'replies.createdBy', 
            select: 'username id' 
        })
        .then(populatedPosts =>{
            res.json(populatedPosts)
        })
        .catch(err =>{
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});

        //Display Training 
router.get('/training', (req, res) => { 
    Bandpost
        .find({'posttype': 'Training_Resource'})
        .populate({
            path: 'createdBy', 
            select: 'username _id' 
        })
        .populate({
            path: 'replies.createdBy', 
            select: 'username id' 
        })
        .then(populatedPosts =>{
            res.status(200).json(populatedPosts)
        })
        .catch(err =>{
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
        });
});



    // --- POST ---
        //Create New Bandpost
router.post('/', jwtAuth, checkRequiredFields, (req, res) => {
    Bandpost
        .create({
            posttype: req.body.posttype,
            topic: req.body.topic,
            description: req.body.description,
            created: req.body.created,
            youtubeLink: req.body.youtubeLink,
            createdBy: req.user.id,
            replies: req.body.replies,
            
        })
        .then(post => {
            return populateBandpost(post);
        })
        .then(populatedPost =>{
            res.status(201).json(populatedPost)
        })
        .catch(err =>{
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });       
});


    // --- PUT ---
        //Update a Bandpost
router.put('/:id', jwtAuth, checkValidUser, checkRequiredFields, (req, res) => {
    console.log(`Updating bandpost entry \`${req.params.id}\``);
    const toUpdate = {};
    const updateableFields = ['posttype', 'topic', 'description', 'youtubeLink']; 
    
    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    })
   toUpdate.modified = Date.now();
    
    Bandpost
        .findByIdAndUpdate(req.params.id, {$set: toUpdate}, { new: true })
            .then(post => {
                return populateBandpost(post);
            })
            .then(populatedPost =>{
                res.status(200).send(populatedPost)
            })
            .catch(err =>{
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            });          
});

    // --- DELETE ---
        //DELETE a Bandpost
router.delete('/:id', jwtAuth, checkValidUser, checkRequiredFields, (req,res) => {
console.log(`Deleting bandpost entry \`${req.params.id}\``);
   
    Bandpost
        .findByIdAndRemove(req.params.id)
        .then(bandpost =>{
            res.status(204).end();
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});

// --- Reply ---
        //POST
router.post('/reply/:id', jwtAuth, checkRequiredFields, (req, res) => {
    console.log(`Adding reply to bandpost \`${req.params.id}\``);
    Bandpost
        .findByIdAndUpdate(req.params.id, 
            {$push: {replies:
                        {
                        "topic": req.body.topic,
                        "reply": req.body.reply,
                        "createdBy": req.user.id
                        }
                    },
            },
            {new: true}
        )
        .populate({
            path: 'replies.createdBy', 
            select: 'username _id' 
        })
        .then(reply => {
            res.status(201).json(reply.serialize())
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' }
            );
        });
});

    // --- Delete ---
        //Delete a reply
router.delete('/reply/:id', jwtAuth, checkValidUser, checkRequiredFields, (req,res) => {
    Bandpost
        .findById(req.params.id)
        .then(bandpost => {
            let subDoc = bandpost.replies.id(req.body.replyId);
            subDoc.remove();
            bandpost.save(function(err){
                if (err) {
                    console.log(err)
                } 
                res.status(204).end();
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});
     
module.exports = {router}; */