const _ = require('lodash');
const mongoBridgeDriver = require('./driver');

const typeElements = [
  {key: 'coll'  , id: 0},
  {key: 'action', id: 1},
  {key: 'param' , id: 2}
];

const errors = {
  sendResponse: {
    empty : 'sendResponse must be defined',
    notAFn: 'sendResponse must be a function'
  },
  message: {
    empty  : 'Impossible to process empty messages',
    payload: 'Message must be an object and have the attribute .payload',
    type   : {
      empty    : 'Message must be an object and have the attribute .type',
      badFormat: 'Message .type is not valid for mongoEventBridge',
    }
  }
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
module.exports = (config) => {
  return function mongoEventBridge(sendResponse){
    assertInputs(sendResponse);
    return _.partial(processEvent, sendResponse);
  };

  function assertInputs(sendResponse){
    if(!sendResponse)
      throw new Error(errors.sendResponse.empty);
    if(typeof sendResponse !== 'function')
      throw new Error(errors.sendResponse.notAFn);
  }

  async function processEvent(sendResponse, message){
    await assertMessage(message);
    const args = await typeToObject(message.type);
    message.payload = (!args.param) ? message.payload : {[args.param]: message.payload};
    var responseMessage = await exectuteAction(args, message);
    sendResponse(responseMessage);
  }

  async function assertMessage(message){
    if(!message)         return pError(errors.message.empty);
    if(!message.type)    return pError(errors.message.type.empty);
    if(!message.payload) return pError(errors.message.payload);
    return Promise.resolve();
  }

  async function typeToObject(type){
    const parts = type.split('/');
    if(!parts || parts.length < 2)
      return pError(errors.message.type.badFormat);

    const obj = {};
    typeElements.forEach((elem) => {
      if(parts[elem.id]) obj[elem.key] = parts[elem.id];
    });
    return obj;
  }

  async function exectuteAction(args, message){
    try{
      const action = mongoBridgeDriver[args.action];
      if(!_.isArray(message.payload)) message.payload = [message.payload];
      const response = await action(config, args.coll, message.payload, message.owner);
      return buildSuccessResponse(args, message, response)
    }
    catch(e){
      return buildErrorResponse(args, message, e);
    }
  }

  function buildErrorResponse(args, message, error){
    // console.log(error);
    const data = {status: "fail", payload: error.message};
    return Object.assign(message, data);
  }

  function buildSuccessResponse(args, message, response){
    delete response.ops;
    delete response.connection;
    delete response.message;
    const data = {status: "response", payload: response};
    return Object.assign(message, data);
  }

  // PromisedError
  function pError(e){
    return Promise.reject(new Error(e));
  }

}
