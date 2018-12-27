// --- MODULES ---
const express = require('express');

// --- IMPORTS ---
const {Group} = require('../models');
const router = express.Router();
const {jwtAuth} = require('../auth');

//remove all entries past current date by more than 7 days
 function Cleanup(){
   return  Group.remove({lunchDate: {$lte: Date.now()-8.64e+7 }}).exec()
 } 

//GROUPS SEARCH
router.get('/', (req,res) => {
    Cleanup()
    return Group.find()
    .populate({
            path: 'createdBy', 
            select: 'chefProfile' 
    })
    .populate({
        path: 'members', 
        select: 'username _id' 
    })
   
      .then(groups =>{
        console.log(groups)
        res.json(groups)
      })
      .catch(err =>{
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  })
  

//CREATE A GROUP
router.post('/', jwtAuth, (req,res) => {
  let {lunchDate, lunchLocation, lunchTime, menu, cost, seatLimit, members} = req.body;
  console.log(lunchDate)
  console.log(req.user);
     Group.create({
       createdBy: req.user.id,
       lunchDate,
       lunchLocation,
       lunchTime,
       menu,
       cost,
       seatLimit,
       members,
    })
    .then(group => { 
      return Group.findById(group._id)
        .populate({
            path: 'createdBy', 
            select: 'chefProfile' 
        }) 
    })
    .then(group => {
        console.log(group);
        return res.status(201).json(group);
    })
    .catch(err => {
    console.log(err); 
    res.status(500).json({code: 500, message: 'Internal server error'})  
    });
});


//EDIT GROUP
router.put('/:id', jwtAuth, (req, res) => {
    let id= req.params.id;;
    let toUpdate= {};
    const updateableFields = ['lunchDate', 'lunchLocation', 'lunchTime', 'menu', 'cost', 'seatLimit']

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field]= req.body[field]
        }
    })
    Group.findByIdAndUpdate(id, {$set:toUpdate}, {new:true})
    .then(groupUpdate => {
        console.log(groupUpdate);
        res.status(200).json(groupUpdate)
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({code:500, message: 'Internal server error'});
    })
});

//DELETE GROUP
router.delete('/:id', jwtAuth, (req, res) => {
    console.log(`Deleting Group \`${req.params.id}\``)
    Group
        .findByIdAndRemove(req.params.id)
        .then(group => {
            res.status(204).end();
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});
  
//JOIN A GROUP
router.post('/members/:id', jwtAuth, (req,res) => {
    Group
    .findByIdAndUpdate(req.params.id, 
        {$push: {members:req.user.id}},
        {new: true}
    )
    .populate({
        path: 'members', 
        select: 'username _id' 
    })
    .then(newGroup => {
        console.log(newGroup)
        res.status(201).json(newGroup)
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' }
        );
    });
})

//LEAVE A GROUP-- not sure if this one works - should test it
router.delete('/members/:id', jwtAuth, (req,res) => {
    Group
        .findByIdAndUpdate(req.params.id,
            {$pull: {members: req.user.id}},
            {new:true}
        )
        .then(members => {
            console.log(members)
            res.status(204).end();
        }) 
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});

module.exports = {router};