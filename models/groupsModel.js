'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
mongoose.Promise = global.Promise;



const GroupSchema = new Schema ({
  createdBy: {type: ObjectId, ref:'User'},
  lunchDate: {type:Date, required: true},
  lunchLocation:{ type: String, required: true},
  menu: { type: String, required: true},
  cost: {type: Number, required: true},
  seatLimit: {type: Number, required:true},
  members: {type: Array, default: []}
})



const Group = mongoose.model('Group', GroupSchema);
module.exports = {Group};
