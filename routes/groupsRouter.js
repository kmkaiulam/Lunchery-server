// --- MODULES ---
const express = require('express');
// --- IMPORTS ---
const {Group} = require('../models');
const router = express.Router();
const {jwtAuth} = require('../auth');


//Groups Search Route
router.get('/', (req,res) => {
    return Group.find()
      .then(groups =>{
        console.log(groups)
        res.json(groups)
      })
      .catch(err =>{
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  })

//how do i have access to the user id from here?
//how do I send the user Id, and put it in the createdBy section?
//retreiving the information for group (chef name, companyName and location is from populating (post doesn't matter))
router.post('/', jwtAuth, (req,res) => {
  let {lunchDate, lunchLocation, menu, cost, seatLimit, members} = req.body;
  console.log(lunchDate)
  console.log(req.user);
    return Group.create({
       createdBy: req.user.id,
       lunchDate,
       lunchLocation,
       menu,
       cost,
       seatLimit,
       members,
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
      
router.put('/:id', jwtAuth, (req, res) => {
    let id= req.params.id;;
    let toUpdate= {};
    const updateableFields = ['lunchDate', 'lunchLocation', 'menu', 'cost', 'seatLimit']

    updateableFields.forEach(field => {
        if (field in req.body.group) {
            toUpdate[field]= req.body.group[field]
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
  
module.exports = {router};