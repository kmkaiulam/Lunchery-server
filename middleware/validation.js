'use strict';
//Post Routers Middleware
const checkValidUser = function(req,res,next) { 
    if(!(req.body.createdById === req.user.id)) {
      const message = `You don't have the rights to modify this entry`
      console.error(message);
      return res.status(400).send(message);
    }
    next();
};
  
  const checkRequiredFields = function(req,res,next){
    let resourceName = req.originalUrl.split('/')[2];
    let nestedResourceName = req.originalUrl.split('/')[3];
    let requestMethod = req.method;
    let requiredFields;

    if (resourceName === 'announcements'){
      switch(requestMethod){
        case 'POST':
          requiredFields = ['posttype', 'text'];
          break;
        case 'PUT':
          requiredFields = ['posttype', 'announcementsId', 'createdById','text'];
          break;
        case 'DELETE':
          requiredFields = ['announcementsId', 'createdById'];
          break;
      }
    }
    if (resourceName === 'bandposts'){
        switch(requestMethod){ 
          case 'POST':
            requiredFields = ['posttype', 'topic', 'description'];
            break;
          case 'PUT':
            requiredFields = ['bandpostsId','createdById', 'posttype', 'topic', 'description'];
            break;
          case 'DELETE':
            requiredFields = ['bandpostsId', 'createdById'];
            break;
        }
    }
    if (nestedResourceName === 'reply'){
        switch(requestMethod){
          case 'POST':  
            requiredFields = ['bandpostsId', 'topic', 'reply'];
            break;
          case 'DELETE':
            requiredFields = ['bandpostsId', 'replyId', 'createdById'];
            break;
        }
    }
    for (let i=0; i<requiredFields.length; i++){
      const field =requiredFields[i];
      if(!(field in req.body) || field === null) {
          const message = `Missing \`${field}\` in request body`
          console.error(message);
          return res.status(400).send(message);
      }
    }
    next()
  };


  module.exports = {checkValidUser, checkRequiredFields};