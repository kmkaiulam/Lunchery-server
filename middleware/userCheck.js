'use strict';
// User Router Middleware
function checkUserRequiredFields(req, res, next){
const requiredFields = ['username', 'password'];
const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `${missingField} Missing`,
      location: missingField
    });
  }
  next();
};

function checkUserStringFields(req, res, next){
  const stringFields = ['username', 'password', 'firstName', 'lastName']
  const nonStringField = stringFields.find(
      field => field in req.body && typeof req.body[field] !== 'string'
      );

  if (nonStringField){
  return res.status(422).json({
      code:422,
      reason: 'ValidationError',
      message: `Incorrect Field type: expected string for ${nonStringField}`,
      location: nonStringField
   });
  }
  next();
};

function checkUserTrimmedFields(req, res, next){
const explicityTrimmedFields = ['username', 'password'];
const nonTrimmedField = explicityTrimmedFields.find(
  field => req.body[field].trim() !== req.body[field]
);

  if (nonTrimmedField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Cannot start or end with whitespace for ${nonTrimmedField}`,
      location: nonTrimmedField
    });
  }
  next();
};

function checkUserSizedFields(req, res, next){
  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 6,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );


  if (tooSmallField || tooLargeField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `${tooSmallField.charAt(0).toUpperCase() + tooSmallField.slice(1)} must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `${tooLargeField.charAt(0).toUpperCase() + tooLargeField.slice(1)} must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }
  next();
};


module.exports = {checkUserRequiredFields, checkUserStringFields, checkUserTrimmedFields, checkUserSizedFields}