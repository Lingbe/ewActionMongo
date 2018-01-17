[![Build Status](https://travis-ci.org/Lingbe/ewActionMongo.svg?branch=master)](https://travis-ci.org/Lingbe/ewActionMongo) [![Coverage Status](https://coveralls.io/repos/github/Lingbe/ewActionMongo/badge.svg?branch=master)](https://coveralls.io/github/Lingbe/ewActionMongo?branch=master)

# Description
Mongo Action connector for eWings framework

## Get Started

### Prerequisites

As previously mentioned, ewActionMongoDB is a plugin for the eWing framework. You can find more information at: [eWings github page](https://github.com/Lingbe/ewActionMongo).

### Install

```
npm install --save ew-action-mongodb
```

### Run tests
ewActionMongoDB is fully tested. In includes:
* Unit tests
* EndToEnd tests
* Coverage tests
* Linting tests

```
npm test
```

## Usage

*eWing Mongo Action* allows you to transform simple object event into complex mongoDB actions without loosing the control of your backend. This is specially usefull when you have an event based frontend like React or Polymer. A event processable by the *eWing Mongo Action* will look like:

```json
{
  "id"     : 1,
  "status" : "request",
  "type"   : "user/insert",
  "owner"  : "owner",
  "payload": {
    "name"  : "john doe",
    "age"   : 25,
    "status": "online"
  }
};
```

This action will **insert** a new document in the **user collection** containing the data defined in the **payload**.

### Event type construction

Every event must follow the following pattern in order to be processed by the *eWing Mongo Action* library:

```javascript
const eventType = `${collection}/${action}/${parameter}`;
```

Collection and action are mandatory of the event type, while parametes is option. An action can only have one of the follow values:
* find
* insert
* remove
* set
* unset
* push
* pull
* addToSet

## Setup

In order to setup the eWing Mongo Action we need a connection to mongoDB and define the model behaviour.

```javascript
const eWings = require('ewings');
const ewActionMongo = require('ew-action-mongodb');
const models = require('./models');
const db = require('db');
const config = {
  db: db,
  models: models,
}
const mongoAction = ewActionMongo(config);
const interfaces = [];

eWings.init(interfaces, [mongoAction]);
```

### MongoDB connection

In order to setup the eWing Mongo Action we need a connection to mongoDB. This can be archived with the following code:

```javascript
let db:
MongoClient.connect(MongoUrlConn, (err, client) => {
  if (err) throw err;
  db = client.db(dbName);
});
```

**Note:** You must user the version 3.0.0 or above of the mongodb native driver.

If you require extra instructions to setup you mongoDB connection, please check the official documentation of the [mongodb](https://www.npmjs.com/package/mongodb) project.

### Model definition
The model object defines all the collections that could be manipulated throw the *eWing Mongo Action* instance. This is an example:

```javascript
const models = {
  user: {
    schema: userSchemaMock,
    roles: roles
  },
  jobs: {
    schema: jobsSchemaMock,
    actions: ['find']
  }
}
```

Each key of the models objects is refers to a collection. Each model object has 3 possible parameters:

* **schema:** Defines the model schema using the library [ajv](https://www.npmjs.com/package/ajv). Here you can find an example of a [simple nested schema](https://github.com/Lingbe/ewActionMongo/blob/master/src/userSchemaMock.js).
* **roles:** This is an optional parameter that defines the different security roles. This work is under progress.
* **actions:** This optional parameter which kind of actions can be executed over the model. If no actions are defined, all actions will be available.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/Lingbe/ewActionMongo/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Lingbe/ewActionMongo/tags).

## Authors

* **Jovi Sogorb** - *Initial work & support* - [joviwap](https://github.com/joviwap)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

We are still waiting for you ;)
