'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
  chef: {
    type: Boolean,
    default: false,
  },
  chefProfile: { 
      displayName: {type: String, default: ''},
      company: {type: String, default: ''},
      location: {type: String, default: ''},
      bio: {type: String, default: ''},
      style: {type: String, default: ''},
      profileImage: {type: String, default: 'default-user-img.png'},  
  }
});


UserSchema.methods.serialize = function(){
  return {
    id: this._id || '',
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    chef: this.chef,
    chefProfile: this.chefProfile
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