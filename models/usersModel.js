'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
mongoose.Promise = global.Promise;



const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  //removed workweek
  chef: {
    type: Boolean,
    default: false,
  },
  //add myGroups linked to another separate schema that grabs all groups this user has registered to --
  //how would I write that? should I write a route in Groups instead that filters groups by whether or not this User_ID is found in members?
        //Needs to be an array of Group IDs that can be populated with information so that both chefs 
        //and diners can manipulate their own user object when they create or join a new group...
        //Would require 2 asynchronous calls being done when submitting the information to manipulate User and Group with different information
        //Only Requires 2 asynchronous calls for Deletion, not PUT since it USER object refers to GROUP  
        // array of Object Ids?
        //BEST TO REMOVE MY GROUPS ENTIRELY JUST DO ASYNC CALL TO GROUPS THAT ARE ASSOCIATED WITH YOUR USER ID
  myGroups: [{
    type: ObjectId, ref: 'Group',
  }],
  chefProfile: { 
      displayName: {type: String, default: ''},
      company: {type: String, default: ''},
      location: {type: String, default: ''},
      bio: {type: String, default: ''},
      style: {type: String, default: ''},
      picture: {type: String, default: ''},  
  }
  //removed availability
});





UserSchema.methods.serialize = function(){
  return {
    id: this._id || '',
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    chef: this.chef,
    chefProfile: this.chefProfile,
    //myGroups
  };
};

UserSchema.methods.validatePassword = function(password){
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password){
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);
module.exports = {User};