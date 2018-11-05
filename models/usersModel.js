'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;


const WorkweekSchema = new Schema ({
  monday: {type: String, default: ''},
  tuesday: {type: String, default: ''},
  wednesday: {type: String, default: ''},
  thursday: {type: String, default: ''},
  friday: {type: String, default: ''}
})

const AvailabilitySchema = new Schema ({
  monday: {type: Boolean, default: false},
  mondayLimit: {type: Number},
  tuesday: {type: Boolean, default: false},
  tuesdayLimit: {type: Number},
  wednesday: {type: Boolean, default: false},
  wednesdayLimit: {type:Number},
  thursday: {type: Boolean, default: false},
  thursdayLimit: {type: Number},
  friday: {type: Boolean, default: false},
  fridayLimit:{type: Number}
})

const ChefProfileSchema = new Schema ({
  displayName: {type: String, default: ''},
  company: {type: String, default: ''},
  style: {type: String, default: ''},
  picture: {type: String, default: ''},
  availability: [AvailabilitySchema],
  signatureDish: {type: String, default: ''}
})


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
  workweek: [{
    monday: {type: String, default: ''},
    tuesday: {type: String, default: ''},
    wednesday: {type: String, default: ''},
    thursday: {type: String, default: ''},
    friday: {type: String, default: ''}
  }],
  chef: {
    type: Boolean,
    default: false,
  },
  chefProfile: { 
      displayName: {type: String, default: ''},
      company: {type: String, default: ''},
      style: {type: String, default: ''},
      picture: {type: String, default: ''},
      availability: [{
        monday: {type: Boolean, default: false},
        mondayLimit: {type: Number, default: 0},
        tuesday: {type: Boolean, default: false},
        tuesdayLimit: {type: Number, default: 0},
        wednesday: {type: Boolean, default: false},
        wednesdayLimit: {type:Number, default: 0},
        thursday: {type: Boolean, default: false},
        thursdayLimit: {type: Number, default: 0},
        friday: {type: Boolean, default: false},
        fridayLimit:{type: Number, default: 0}
      }],
      signatureDish: {type: String, default: ''}
  }
});





UserSchema.methods.serialize = function(){
  return {
    id: this._id || '',
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    chef: this.chef,
    workweek: this.workweek,
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