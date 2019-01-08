'use strict';
require('dotenv').config();
// --- MODULES ---
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
      mongoose.Promise = global.Promise;
const passport = require('passport');


// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded(({
  extended: true
})));


// --- LOGGING ---
app.use(morgan('common'));


// --- IMPORTS ---
const {usersRouter} = require('./routes');
const {groupsRouter} = require('./routes');
const {authRouter, localStrategy, jwtStrategy } = require('./auth');

// --- CONFIG ---
const { PORT, DATABASE_URL } = require('./config');



// --- CORS ---
app.use(function (req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS'){
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);


// --- ENDPOINTS ---
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/groups/', groupsRouter);

let server;

function runServer(databaseUrl, port = PORT){
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useNewUrlParser: true}, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}
function closeServer(){
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) =>{
      console.log('Closing server');
      server.close(err => {
        if (err){
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module){
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {runServer, app, closeServer};