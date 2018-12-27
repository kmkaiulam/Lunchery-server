const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');
const {User, Group} = require('../models');
chai.use(chaiHttp);
const {app, runServer, closeServer} = require ('../server')
const {TEST_DATABASE_URL} = require('../config');


mongoose.Promise = global.Promise;
// --- Global Variables
let newUsers = [];

//--- Generate New Group
function generateNewGroup(newUser){
    return {
        createdBy: newUser,
        lunchDate: faker.date.future(),
        lunchLocation: 'Cafe',
        lunchTime: '12:00',
        menu: faker.lorem.sentence(),
        cost: faker.random.number(),
        seatLimit: faker.random.number(),
        members: [{}],
        text: faker.lorem.paragraph()
    }
}

// --- Generate For Seed Data
function generateUserData(){
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: '123123',
    }
};


// --- Seeding Data
function seedUserData(){
    console.info ('seeding User data')
    let user = [];
    let hashedPassword = [];
    for (let i = 0; i<2; i++){
        user.push(generateUserData());
    }
    unhashedUsers = user;
    let newHashedUsers = user;
    for (let i = 0; i<2; i++){
        hashedPassword.push(User.hashPassword(user[i].password))
    }
    return Promise.all(hashedPassword)
        .then (hashedPassword => {
            newHashedUsers[0].password = hashedPassword[0]
            newHashedUsers[1].password= hashedPassword[1]
            return User.insertMany(newHashedUsers)
        })
        .then(newHashedUsers =>{ 
            newUsers.push(newHashedUsers[0])
            newUsers.push(newHashedUsers[1])
        })
};
            
function seedGroupData(newUser){
    console.info ('seeding Group data')
    const groupData = [];
    for (let i = 1; i<=2; i++){
        groupData.push(generateNewGroup(newUsers));
    };
    return Announcement.insertMany(announcementData);
};



function seedData(){
    return seedUserData()
        .then (data => {
        return  Promise.all([seedGroupData(newUsers)])
            .then (values => {
                console.log('Seeding All Data')
            });
        });
};

function dropDatabase(){
    console.warn('Deleting Database');
    return mongoose.connection.dropDatabase();
}