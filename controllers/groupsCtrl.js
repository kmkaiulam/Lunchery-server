'use strict';
// --- IMPORTS --- 
const {Group} = require('../models');
 
// --- EXPORTS --- 
const groupsCtrl = {};

// --- Group functions
const Cleanup = () => {
    return  Group.remove({lunchDate: {$lte: Date.now()-8.64e+7 }}).exec()
} 

const PopulateGroup = () => {
     return Group.find()
     .populate({
             path: 'createdBy', 
             select: 'chefProfile' 
     })
     .populate({
         path: 'members', 
         select: 'username _id' 
     })  
}
 
groupsCtrl.searchGroups = function(req, res) {
    Cleanup()
    PopulateGroup()
      .then(groups =>{
        res.json(groups)
      })
      .catch(err =>{
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
}
 
groupsCtrl.createGroup = function(req, res) {
    let {lunchDate, lunchLocation, lunchTime, menu, cost, seatLimit, members} = req.body;
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
         return res.status(201).json(group);
     })
     .catch(err => {
     console.log(err); 
     res.status(500).json({code: 500, message: 'Internal server error'})  
     });
}   
 
groupsCtrl.editGroup = function(req, res) {

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
        PopulateGroup()
        .then(updatedGroups => {
            res.status(200).json(updatedGroups)
        })
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({code:500, message: 'Internal server error'});
    });
}

groupsCtrl.deleteGroup = function(req, res) {
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
}

groupsCtrl.joinGroup = function(req,res) {
    Group
    .findByIdAndUpdate(req.params.id, 
        {$push: {members:req.user.id}},
        {new: true}
    )
    .then(newGroup => {
        PopulateGroup()
        .then(updatedGroups => {
        res.status(200).json(updatedGroups)
        })
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' }
        );
    });
}
 
groupsCtrl.leaveGroup = function(req, res) {
    Group
    .findByIdAndUpdate(req.params.id,
        {$pull: {members: req.user.id}},
        {new:true}
    )
    .then(newGroup => {
        PopulateGroup()
        .then(updatedGroups => {
        res.status(200).json(updatedGroups)
        })
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    });
}

module.exports = groupsCtrl;