const _   = require('lodash');
const Ajv = require('ajv');
const ajv = new Ajv({});
const actions = require('./actions');

const errMsgs = {
  input: {
    db    : 'mongo connection must be defined',
    coll  : 'imposible to exectute mongoDB action if the collection was not specified',
    args  : 'imposible to exectute mongoDB action if no arguments were specified',
    action: 'imposible to exectute mongoDB action if the action was not specified',
    actionInvalid: (action) => `imposible to exectute mongoDB action because the action ${action} is not valid`,
    argsEmpty  : 'no arguments were defined in a mongoDB query',
    argsLength : 'too many arguments were defined in a mongoDB query',
    argsArray  : 'mongoDB query arguments must be an array',
    basicAction: 'a mongoDB query for a basic action () can\'t have 3 arguments'
  },
  models: {
    schemaNotFound: 'The schema does not exists',
  }
};

module.exports = {
  input: inputValidator,
  schema: schemaValidator,
  action: actionValidator
};

async function inputValidator(db, coll, args, action){
  var error = (!db)     ? errMsgs.input.db     :
              (!coll)   ? errMsgs.input.coll   :
              (!args)   ? errMsgs.input.args   :
              (!action) ? errMsgs.input.action :
              (!actions.isValid(action)) ? errMsgs.input.actionInvalid(action) :
              (!_.isArray(args)) ? errMsgs.input.argsArray  :
              (args.length > 3)  ? errMsgs.input.argsLength :
              (args.length < 1)  ? errMsgs.input.argsEmpty  :
              (args.length > 2 && actions.isBasic(action)) ?
                errMsgs.input.basicAction : null;
  return (error) ? Promise.reject(error) : Promise.resolve();
}

function schemaValidator(model, coll, data, action){
  if(!model.schema) throw new Error(errMsgs.models.schemaNotFound);
  const validator = getValidator(coll, model.schema);
  const valid = validator(data);
  if(!valid){
    const err = validator.errors[0];
    if(err.message === 'should be array' && actions.isArray(action)) return valid;
    throw new Error(`${err.dataPath} ${err.message}`);
  }
  return valid;
}

function getValidator(name, schema){
  const validator = ajv.getSchema(name);
  if  (!validator)  ajv.addSchema(schema);
  return validator || ajv.getSchema(name);
}

function actionValidator(model, action){
  const hasAction = (model && model.actions);
  return (!hasAction) || (model.actions.indexOf(action) > -1);
}
