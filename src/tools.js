/* eslint
consistent-return: ["error", { "treatUndefinedAsUnspecified": false }]
no-param-reassign: ["error", {
  "props": true,
  "ignorePropertyModificationsFor": ["args"]
}] */

const _   = require('lodash');
const validators = require('./tools.validators');
const actions = require('./actions');

const errors = {
  emptyData  : 'Can\'t validate empty data',
  emptyModels: 'It is mandatory to provide models to validate the schema',
  models     : {
    empty      : 'It is mandatory to provide models to validate the schema',
    isNotObject: 'The model list provided is not an Object',
    notFound   : 'Required model does not exists',
    private    : 'An owner must be defined in order to secure the db query on private models'
  }
};

module.exports = {
  inputValidator : validators.input,
  schemaValidator: validators.schema,
  actionValidator: validators.action,
  getData,
  getModel,
  formatAction,
  formatArgs,
  secureArgs
};

// config: {
//   db: MongoDB connection
//   models: {
//     modelName: {
//       schema: Ajv Schema,
//       actions: Array of defined in actions.js
//       private: Boolean (false by default)
//     },
//     ...
//   }
// }
function getModel(config, collection) {
  if (!config || !config.models) throw new Error(errors.models.empty);
  if (!_.isObject(config.models)) throw new Error(errors.models.isNotObject);
  if (!config.models[collection]) throw new Error(errors.models.notFound);
  return config.models[collection];
}

function getData(args, action) {
  if (actions.isQuery(action)) return undefined;
  const key = (actions.isBasic(action)) ? 0 : 1;
  return args[key];
}

function formatAction(action) {
  return actions.isBasic(action) ? action : 'update';
}

function formatArgs(args, action) {
  if (!actions.isBasic(action)) {
    args[1] = { [`$${action}`]: args[1] };
  }
  return args;
}

function secureArgs(model, args, action, owner) {
  if (!model.private) return args;
  if (!owner) throw new Error(errors.models.private);
  args[0] = Object.assign(args[0], { owner });
  return args;
}
