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
        createdBy: newUser[0]._id,
        lunchDate: faker.date.future(),
        lunchLocation: 'Cafe',
        lunchTime: '12:00',
        menu: faker.lorem.sentence(),
        cost: faker.random.number(),
        seatLimit: faker.random.number(),
        members: []
    }
}

function generatePastGroup(newUser){
    return {
        createdBy: newUser[0]._id,
        lunchDate: faker.date.past(),
        lunchLocation: 'Cafe',
        lunchTime: '12:00',
        menu: faker.lorem.sentence(),
        cost: faker.random.number(),
        seatLimit: faker.random.number(),
        members: [],
    }
}

// --- Generate Group Update
function generateGroupUpdate(){
    return {
        lunchDate: faker.date.future(),
        lunchLocation: 'Cafe',
        lunchTime: '12:00',
        menu: faker.lorem.sentence(),
        cost: faker.random.number(),
        seatLimit: faker.random.number(),
        members: []
    }
}

// --- Generate For Seed Data
function generateUserData(){
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: '123123',
        chef: true,
    }
};

function generateChefProfileData(){
    return {
        profile: {
            displayName: faker.name.firstName(),
            company: faker.company.companyName(),
            location: faker.address.city(),
            bio: faker.lorem.paragraph(),
            style: faker.address.country()
        }
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
    let groupData = [];
    for (let i = 1; i<=2; i++){
        groupData.push(generateNewGroup(newUsers));
    };
        groupData.push(generatePastGroup(newUsers));
    return Group.insertMany(groupData);
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


describe('Lunchery API resources', function(){

    before(function(){
       return runServer(TEST_DATABASE_URL)
       .then (data => {
           return seedData();
       });
    });
    

    after(function(){
        return dropDatabase()
        .then (data => {
            return closeServer()
        }); 
    });

    describe('POST /api/auth/login', function(){
        
        it('should allow a registered user to login and return an authToken', function(){ 
            let agent = chai.request.agent(app)
            return agent
                .post('/api/auth/login')
                .send({username: newUsers[0].username , password: '123123'})

                .then(function(res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys('authToken');
            });
        });

        // it('should reject a user that is not registered', function(){
        //     let agent = chai.request.agent(app)
        //     let unregisteredUser = generateUserData();
        //     return agent
        //         .post('/api/auth/login')
        //         .send({username: unregisteredUser.username , password: '123123'})
        //         .then(function(res){
        //             expect(res).to.have.status(401);
        //     });
        // });
    });


    describe('GET /api/users', function(){
        it('should return a serialized user', function(){
            let agent = chai.request.agent(app)
            return agent
                .post('/api/auth/login')
                .send({username: newUsers[0].username , password: '123123'})
                .then(function(res){
                    let userId = newUsers[0]._id;
                    let authToken = res.body.authToken;
                    expect(res).to.have.status(200);
                    expect(res.body).to.include.keys('authToken')
            return agent
            .get(`/api/users/${userId}/`)
            .set('Authorization', `Bearer ${authToken}`)
            })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res).to.be.a('object');
                expect(res.body).to.not.include.keys('password');
                expect(res.body).to.include.keys('id', 'firstName', 'lastName', 'username', 'chefProfile', 'chef');
            }); 
        });
    });


    describe('POST /api/users', function(){

        it('should create a new User', function(){
            let newUser = generateUserData()
            let user;
                return chai.request(app)
                .post('/api/users')
                .send(newUser)
                .then(res => {
                    expect(res).to.have.status(201) 
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    user = res.body;
                    expect(user).to.include.keys('firstName', 'lastName', 'username', 'id', 'chef', 'chefProfile');
                    expect(user.firstName).to.be.a('string');
                    expect(user.lastName).to.be.a('string');
                    expect(user.username).to.be.a('string');
                    expect(user.chef).to.be.a('boolean')
                    expect(user.chefProfile).to.be.a('object')
                    expect(user.chefProfile).to.include.keys('displayName', 'company', 'location', 'bio', 'style', 'profileImage')
                    expect(user.chefProfile.displayName).to.be.a('string');
                    expect(user.chefProfile.company).to.be.a('string');
                    expect(user.chefProfile.location).to.be.a('string');
                    expect(user.chefProfile.bio).to.be.a('string');
                    expect(user.chefProfile.style).to.be.a('string');
                    expect(user.chefProfile.profileImage).to.be.a('string');
                    expect(user.firstName).to.equal(newUser.firstName)
                    expect(user.lastName).to.equal(newUser.lastName)
                    expect(user.username).to.equal(newUser.username)
                    expect(user.id).to.be.a('string');
                 return User.findById(user.id)
                })
                .then(dbUser => {
                    expect(String(dbUser._id)).to.equal(user.id);
                    expect(dbUser.firstName).to.equal(newUser.firstName);
                    expect(dbUser.lastName).to.equal(newUser.lastName);
                    expect(dbUser.username).to.equal(newUser.username);
                });            
        });

        it('should not add user if username is not unique', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username: newUsers[0].username, password: '123123', firstName: 'Stan', lastName:'Lei', chef:'false' })
            .then(res => {
                expect(res).to.have.status(422)
                expect(res.body).to.have.keys('code', 'reason', 'message', 'location')
                expect(res.body.message).to.equal('Username already taken')
                expect(res.body.location).to.equal('username')
            });
        })
        
        it('should not add user if a required field is missing', function(){
            let missingFieldUser = {username: 'uniqueUser21', password: '123123', firstName: 'Stan', lastNam: 'Key is incorrectly spelled, therefore lastName is missing'}
            return chai.request(app)
            .post('/api/users')
            .send(missingFieldUser)
            .then(res => {
                expect(res).to.have.status(500)
                expect(res.body.message).to.equal('Internal server error')
            })
        })
    })


    describe('PUT /api/users/:id Profile Edit Route ', function(){
        
        it('should allow a user to edit his personal chefProfile', function(){
            let profileUpdate = generateChefProfileData();
            let agent = chai.request.agent(app)
            return agent
                .post('/api/auth/login')
                .send({username: newUsers[0].username , password: '123123'})
                .then(function(res){
                    let userId = newUsers[0]._id;
                    let authToken = res.body.authToken;
                    expect(res).to.have.status(200);
                    expect(res.body).to.include.keys('authToken')
            return agent
            .put(`/api/users/${userId}/`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(profileUpdate)
            })
            .then(res => {
               let resProfile = res.body.chefProfile;
                expect(res).to.have.status(200);
                expect(res.body).to.include.keys('firstName', 'lastName', 'username', '_id', 'chef', 'chefProfile');
                expect(resProfile).to.include.keys('displayName', 'company', 'location', 'bio', 'style', 'profileImage');
                expect(resProfile.displayName).to.be.a('string');
                expect(resProfile.company).to.be.a('string');
                expect(resProfile.location).to.be.a('string');
                expect(resProfile.bio).to.be.a('string');
                expect(resProfile.style).to.be.a('string');
                expect(resProfile.profileImage).to.be.a('string');
                expect(resProfile.displayName).to.equal(profileUpdate.profile.displayName);
                expect(resProfile.company).to.equal(profileUpdate.profile.company);
                expect(resProfile.location).to.equal(profileUpdate.profile.location);
                expect(resProfile.bio).to.equal(profileUpdate.profile.bio);
                expect(resProfile.style).to.equal(profileUpdate.profile.style);
            })
        })
    })



    describe('GET /api/groups', function(){
       
        it('should return all existing groups, removing any groups scheduled for a past date', function(){
            let agent = chai.request.agent(app)
            return agent
            .get('/api/groups')
            .then(function(res){
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res).to.be.a('object');
                expect(res.body.length).to.equal(2);
                res.body.forEach(function(group){
                    expect(group).to.include.keys('_id', 'cost', 'createdBy', 'lunchDate', 'lunchLocation', 'lunchTime', 'members', 'menu', 'seatLimit');
                    expect(group._id).to.be.a('string');
                    expect(group.cost).to.be.a('number');
                    expect(new Date(group.lunchDate)).to.be.a('date');
                    expect(group.lunchLocation).to.be.a('string');
                    expect(group.lunchTime).to.be.a('string');
                    expect(group.members).to.be.an('array');
                    expect(group.menu).to.be.a('string');
                    expect(group.seatLimit).to.be.a('number');
                    expect(group.createdBy).to.be.a('object');
                    expect(group.createdBy).to.include.keys('_id', 'chefProfile')
                    expect(group.createdBy.chefProfile).to.be.a('object')
                    expect(group.createdBy.chefProfile).to.include.keys('displayName', 'company', 'location', 'bio', 'style', 'profileImage')
                })
            })
        })
    });
   
    describe('POST /api/groups', function(){
        
        it('should create a new group', function(){
            let newGroup =  generateNewGroup(newUsers)
            let agent = chai.request.agent(app)
            return agent
                .post('/api/auth/login')
                .send({username: newUsers[0].username , password: '123123'})
                .then(function(res){
                    let authToken = res.body.authToken;
                    expect(res).to.have.status(200);
                    expect(res.body).to.include.keys('authToken')
            return agent
            .post('/api/groups')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newGroup)
            })
            .then(res => {
                expect(res).to.have.status(201)
                expect(res.body).to.include.keys('_id', 'cost', 'createdBy', 'lunchDate', 'lunchLocation', 'lunchTime', 'members', 'menu', 'seatLimit');
                expect(res.body.createdBy._id).to.equal(newUsers[0].id);
                expect(res.body.cost).to.equal(newGroup.cost);
                expect(new Date(res.body.lunchDate).toDateString()).to.equal(new Date(newGroup.lunchDate).toDateString());
                expect(res.body.lunchLocation).to.equal(newGroup.lunchLocation);
                expect(res.body.lunchTime).to.equal(newGroup.lunchTime);
                expect(res.body.members).to.deep.equal(newGroup.members);
                expect(res.body.menu).to.equal(newGroup.menu);
                expect(res.body.seatLimit).to.equal(newGroup.seatLimit);
            }); 
        });
    });

    describe('PUT /api/groups/id:', function(){
        
        it('should allow a user to edit a group', function(){
            let groupUpdate =  generateGroupUpdate()
            let agent = chai.request.agent(app)
            return agent
            .get('/api/groups')
            .then(function(res){
                let groupId = res.body[0]._id
                expect(res).to.have.status(200);
                return agent
                    .post('/api/auth/login')
                    .send({username: newUsers[0].username , password: '123123'})
                    .then(function(res){
                        let authToken = res.body.authToken;
                        expect(res).to.have.status(200);
                        expect(res.body).to.include.keys('authToken')
                    return agent
                    .put(`/api/groups/${groupId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(groupUpdate)
                     })
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body[0].lunchLocation).to.equal(groupUpdate.lunchLocation);
                        expect(res.body[0].lunchTime).to.equal(groupUpdate.lunchTime);
                        expect(res.body[0].members).to.deep.equal(groupUpdate.members);
                        expect(res.body[0].menu).to.equal(groupUpdate.menu);
                        expect(res.body[0].seatLimit).to.equal(groupUpdate.seatLimit);
                    });
            });
        });
    });

    describe('DELETE /api/groups/id:', function(){
       
        it('should allow a user to delete a group', function(){
            let agent = chai.request.agent(app)
            return agent
            .get('/api/groups')
            .then(function(res){
                let groupId = res.body[0]._id
                expect(res).to.have.status(200);
                return agent
                    .post('/api/auth/login')
                    .send({username: newUsers[0].username , password: '123123'})
                    .then(function(res){
                        let authToken = res.body.authToken;
                        expect(res).to.have.status(200);
                        expect(res.body).to.include.keys('authToken')
                    return agent
                    .delete(`/api/groups/${groupId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    })
                    .then(res => {
                        expect(res).to.have.status(204)
                    });
            });
        });
    });

    describe('POST /api/groups/members/:id', function(){
        
        it('should allow a user to join a group', function(){
        let agent = chai.request.agent(app)
        return agent
        .get('/api/groups')
            .then(function(res){
            let groupId = res.body[0]._id
            expect(res).to.have.status(200);
            return agent
                .post('/api/auth/login')
                .send({username: newUsers[1].username , password: '123123'})
                .then(function(res){
                    let authToken = res.body.authToken;
                    expect(res).to.have.status(200);
                    expect(res.body).to.include.keys('authToken');
                return agent
                    .post(`/api/groups/members/${groupId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                })
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body[0].members).to.be.an('array');
                        expect(res.body[0].members[0]).to.be.an('object');
                        expect(res.body[0].members[0]).to.include.keys('_id', 'username');
                        expect(res.body[0].members[0].username).to.equal(newUsers[1].username);
                        expect(res.body[0].members[0]._id).to.include(newUsers[1]._id);
                    });

            });
        });
    });
    
    describe('DELETE /api/groups/members/:id', function(){

        it('should allow a user to leave a group he is a part of', function(){
            let agent = chai.request.agent(app)
            let authToken;
            return agent
            .get('/api/groups')
                .then(function(res){
                    let groupId = res.body[0]._id
                    expect(res).to.have.status(200);
                    return agent
                        .post('/api/auth/login')
                        .send({username: newUsers[1].username , password: '123123'})
                        .then(function(res){
                            authToken = res.body.authToken;
                            expect(res).to.have.status(200);
                            expect(res.body).to.include.keys('authToken');
                            return agent
                                .post(`/api/groups/members/${groupId}`)
                                .set('Authorization', `Bearer ${authToken}`)
                        })
                        .then(function(res){
                            return agent
                            .delete(`/api/groups/members/${groupId}`)
                            .set('Authorization', `Bearer ${authToken}`)
                        })
                        .then(function(res){
                            expect(res).to.have.status(200);
                            return agent 
                            .get('/api/groups')
                            .then(function(res){
                                expect(res.body[0].members).to.not.include(newUsers[1]._id);
                            });
                        });
                });
        })
    })
});






































