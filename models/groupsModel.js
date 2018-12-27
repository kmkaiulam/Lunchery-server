'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
mongoose.Promise = global.Promise;


const GroupSchema = new Schema ({
  createdBy: {type: ObjectId, ref:'User'},
  lunchDate: {type:Date},
  lunchLocation:{ type: String},
  lunchTime: {type: String},
  menu: { type: String},
  cost: {type: Number},
  seatLimit: {type: Number},
  members: [{type: ObjectId, ref:'User'}],
});




const Group = mongoose.model('Group', GroupSchema);
module.exports = {Group};
