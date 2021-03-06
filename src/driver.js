const { Cursor } = require('mongodb');
const tools = require('./tools');

module.exports = {
  find    : mongoFn('find'),
  remove  : mongoFn('remove'),
  insert  : mongoFn('insert'),
  set     : mongoFn('set'),
  unset   : mongoFn('unset'),
  addToSet: mongoFn('addToSet'),
  push    : mongoFn('push'),
  pull    : mongoFn('pull')
};

// config: {
//   db: MongoDB connection
//   models: {
//     modelName: {
//       schema: Ajv Schema,
//       actions: Array of defined in actions.js,
//       private: Boolean (false by default)
//     },
//     ...
//   }
// }
function mongoFn(action) {
  return async function driver(config, coll, args, owner) {
    const { db } = config;
    let dbAction;
    let securedArgs;
    try {
      await tools.inputValidator(db, coll, args, action);
      const model = tools.getModel(config, coll);
      const data = tools.getData(args, action);
      if (data && action !== 'unset') tools.schemaValidator(model, coll, data, action);
      const formatedArgs = tools.formatArgs(args, action);
      securedArgs = tools.secureArgs(model, formatedArgs, action, owner);
      dbAction = tools.formatAction(action);
    } catch (e) {
      return Promise.reject(e);
    }

    return new Promise((resolve, reject) => {
      securedArgs.push(callback);
      const collection = db.collection(coll);
      const fn = collection[dbAction];
      fn.apply(collection, securedArgs);

      function callback(err, response) {
        if (err) return reject(err);
        if (response instanceof Cursor) return processCursor(response);
        return resolve(response);
      }

      function processCursor(cursor) {
        cursor.toArray((error, data) => {
          (error) ? reject(error) : resolve(data);
        });
      }
    });
  };
}
