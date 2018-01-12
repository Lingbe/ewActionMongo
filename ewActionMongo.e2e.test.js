const expect = require('chai').expect;
const MongoClient  = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const MongoUrlConn = 'mongodb://localhost:27017';
const dbName = 'mongoEventBridgeFull';

const userSchemaMock   = require('./userSchemaMock');
const publicSchemaMock = require('./userSchemaMock');
const ewActionMongo = require('./index');
const coll = 'user';
const owner = new ObjectId();
const mockFriend = new ObjectId();

let client;
let userColl;
let dbStub;
let insertedObjectId;
const config = {
  db: undefined,
  models: {
    user  : {schema: userSchemaMock,   private: true},
    public: {schema: publicSchemaMock, actions: ['find']}
  }
}

const action = ewActionMongo(config);

describe('[E2E] driver', () => {

  before('open and clean MongoDB connection', (done) => {
    MongoClient.connect(MongoUrlConn, (err, dbClient) => {
      if (err) throw err;
      client = dbClient;
      config.db = client.db(dbName);
      config.db.collection('public').insert({name: "hello world"});
      done();
    });
  });

  after('close and clean MongoDB connection', (done) => {
    config.db.collection(coll).drop(() => {
      config.db.collection('public').drop(() => {
        client.close(done);
      });
    });
  });

  it('must insert a new user with the type "user/insert"', async () => {
    const idMock = '1';
    const typeMock = 'user/insert'
    const message = {
      id: idMock,
      status: 'request',
      type: typeMock,
      owner: owner,
      payload: {
        name: 'john doe',
        age: 25,
        status: 'online'
      }
    };

    await action(callback)(message)

    function callback(response){
      expect(response).to.be.an('Object');
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('response');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.an('Object');
      expect(response.payload.insertedCount).to.be.equal(1);
      insertedObjectId = response.payload.insertedIds[0];
    }
  });

  it('must insert a new user with the type "user/find"', async () => {
    const idMock = '2';
    const typeMock = 'user/find'
    const message = buildMessage(idMock, typeMock, owner, {
      _id: insertedObjectId
    });

    await action(callback)(message)

    function callback(response){

      expect(response).to.be.an('Object');
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('response');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.an('Array').to.have.lengthOf(1);
      expect(response.payload[0].name).to.be.equal('john doe');
    }
  });

  it('must set a new status in the user with the type "user/set"', async () => {
    const idMock = '3';
    const typeMock = 'user/set'
    const message = buildMessage(idMock, typeMock, owner, [
      {_id: insertedObjectId}, {status:'offline'}
    ]);

    await action(callback)(message)

    function callback(response){
      expect(response).to.be.an('Object');
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('response');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.an('Object');
      expect(response.payload.result).to.be.an('Object');
      expect(response.payload.result.nModified).to.be.equal(1);
    }
  });

  it.skip('must set a new status in the user with the type "user/set/status"', async () => {
    const idMock = '4';
    const typeMock = 'user/set'
    const message = buildMessage(idMock, typeMock, owner, [
      {_id: insertedObjectId}, 'online'
    ]);

    await action(callback)(message)

    function callback(response){
      expect(response).to.be.an('Object');
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('response');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.an('Object');
      expect(response.payload.result).to.be.an('Object');
      expect(response.payload.result.nModified).to.be.equal(1);
    }
  });

  it('must set a new status in the user with the type "user/push"', async () => {
    const idMock = '5';
    const typeMock = 'user/push'
    const message = buildMessage(idMock, typeMock, owner, [
      {_id: insertedObjectId}, {lang: {
        "code"  : 'ES',
        "native": true,
        "level" : 2
      }}
    ]);

    await action(callback)(message)

    function callback(response){
      expect(response).to.be.an('Object');
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('response');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.an('Object');
      expect(response.payload.result).to.be.an('Object');
      expect(response.payload.result.nModified).to.be.equal(1);
    }
  });

  it('must insert a new user with the type "user/find"', async () => {
    const idMock = '6';
    const typeMock = 'user/find'
    const message = buildMessage(idMock, typeMock, owner, {
      _id: insertedObjectId
    });

    await action(callback)(message)

    function callback(response){
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('response');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.an('Array').to.have.lengthOf(1);
      expect(response.payload[0].name).to.be.equal('john doe');
      expect(response.payload[0].lang).to.be.an('Array').to.have.lengthOf(1);
      expect(response.payload[0].lang[0].code).to.be.equal('ES');

    }
  });

  it('must return a fail when the validation fails with the type "user/insert"', async () => {
    const idMock = '7';
    const typeMock = 'user/insert'
    const message = buildMessage(idMock, typeMock, owner, {
      status: 'wrong'
    });

    await action(callback)(message)

    function callback(response){
      expect(response).to.be.an('Object');
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('fail');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.equal('.status should match pattern "(online|offline)"');
    }
  });

  it('must return data from the "public" model with "public/find"', async () => {
    const idMock = '8';
    const typeMock = 'public/find'
    const message = buildMessage(idMock, typeMock, owner, {});

    await action(callback)(message)

    function callback(response){
      expect(response).to.be.an('Object');
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('response');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.an('Array').to.have.lengthOf(1);
      expect(response.payload[0]).to.be.an('Object');
      expect(response.payload[0].name).to.be.equal('hello world');
    }
  });

  it('must return a fail if trying the insert data in the protected "public" model with "public/insert"', async () => {
    const idMock = '9';
    const typeMock = 'public/insert'
    const message = buildMessage(idMock, typeMock, owner, [
      {name: 'hello world'},{do: 'something'}
    ]);

    await action(callback)(message)

    function callback(response){
      console.log(response);
      expect(response).to.be.an('Object');
      expect(response.id).to.be.equal(idMock);
      expect(response.status).to.be.equal('response');
      expect(response.type).to.be.equal(typeMock);
      expect(response.payload).to.be.an('Array').to.have.lengthOf(1);
      expect(response.payload[0]).to.be.an('Object');
      expect(response.payload[0].name).to.be.equal('hello world');
    }
  });

});

function buildMessage(id, type, owner, payload){
  const msg = {
    id: id,
    status: 'request',
    type: type,
    payload: payload
  };
  if(owner) msg.owner = owner;
  return msg;
}
