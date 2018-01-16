const { expect } = require('chai');
const sinon  = require('sinon');
const { MongoClient }  = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

const MongoUrlConn = 'mongodb://localhost:27017';
const dbName = 'mongoEventBridgeDriver';

const userSchemaMock = require('./userSchemaMock');
const driver = require('./driver');

const coll = 'user';
const owner = new ObjectId();
const mockFriend = new ObjectId();

let client;
let userColl;
let dbStub;
const config = {
  db    : undefined,
  models: { user: { schema: userSchemaMock, private: true } }
};


describe('[E2E] driver', () => {
  before('open and clean MongoDB connection', (done) => {
    MongoClient.connect(MongoUrlConn, (err, dbClient) => {
      if (err) throw err;
      client = dbClient;
      config.db = client.db(dbName);
      userColl = config.db.collection(coll);
      dbStub = sinon.stub(config.db, 'collection');
      done();
    });
  });

  after('close and clean MongoDB connection', (done) => {
    config.db.collection(coll).drop(() => {
      client.close(done);
    });
  });

  beforeEach('set db collection stub', () => {
    dbStub.restore();
    dbStub.returns(userColl);
  });

  describe('#insert', () => {
    it('must insert some basic data', async () => {
      const result = await driver.insert(config, coll, [{ status: 'online' }], owner);
      expect(result).to.have.keys('result', 'ops', 'insertedCount', 'insertedIds');
      expect(result.result).to.have.keys('ok', 'n');
      expect(result.result.ok).to.be.equal(1);
      expect(result.result.n).to.be.equal(1);
    });

    it('must read the previosly inserted data', async () => {
      const result = await driver.find(config, coll, [{ status: 'online' }], owner);
      expect(result).to.be.an('array').to.have.lengthOf(1);
      expect(result[0]).to.have.keys('_id', 'status', 'owner');
      expect(result[0]._id).to.be.an.instanceof(ObjectId);
      expect(result[0].status).to.be.equal('online');
      expect(result[0].owner.toString()).to.be.equal(owner.toString());
    });
  });

  describe('#set', () => {
    it('must update the selected data', async () => {
      const result = await driver.set(config, coll, [{ status: 'online' }, { name: 'test' }], owner);
      expect(result).to.have.keys('result', 'message', 'connection');
      expect(result.result).to.have.keys('ok', 'n', 'nModified');
      expect(result.result.ok).to.be.equal(1);
      expect(result.result.n).to.be.equal(1);
      expect(result.result.nModified).to.be.equal(1);
    });

    it('must read the previosly modified data', async () => {
      const result = await driver.find(config, coll, [{}], owner);
      expect(result).to.be.an('array').to.have.lengthOf(1);
      expect(result[0]).to.have.keys('_id', 'status', 'owner', 'name');
      expect(result[0]._id).to.be.an.instanceof(ObjectId);
      expect(result[0].status).to.be.equal('online');
      expect(result[0].name).to.be.equal('test');
      expect(result[0].owner.toString()).to.be.equal(owner.toString());
    });
  });

  describe('#unset', () => {
    it('must update the selected data', async () => {
      const result = await driver.unset(config, coll, [{ status: 'online' }, { name: 1 }], owner);
      expect(result).to.have.keys('result', 'message', 'connection');
      expect(result.result).to.have.keys('ok', 'n', 'nModified');
      expect(result.result.ok).to.be.equal(1);
      expect(result.result.n).to.be.equal(1);
      expect(result.result.nModified).to.be.equal(1);
    });

    it('must read the previosly modified data', async () => {
      const result = await driver.find(config, coll, [{}], owner);
      expect(result).to.be.an('array').to.have.lengthOf(1);
      expect(result[0]).to.have.keys('_id', 'status', 'owner');
      expect(result[0]._id).to.be.an.instanceof(ObjectId);
      expect(result[0].status).to.be.equal('online');
      expect(result[0].owner.toString()).to.be.equal(owner.toString());
    });
  });

  describe('#push', () => {
    it('must update the selected data', async () => {
      const result = await driver.push(config, coll, [{ status: 'online' }, { friends: mockFriend }], owner);
      expect(result).to.have.keys('result', 'message', 'connection');
      expect(result.result).to.have.keys('ok', 'n', 'nModified');
      expect(result.result.ok).to.be.equal(1);
      expect(result.result.n).to.be.equal(1);
      expect(result.result.nModified).to.be.equal(1);
    });

    it('must read the previosly modified data', async () => {
      const result = await driver.find(config, coll, [{}], owner);
      expect(result).to.be.an('array').to.have.lengthOf(1);
      expect(result[0]).to.have.keys('_id', 'status', 'owner', 'friends');
      expect(result[0]._id).to.be.an.instanceof(ObjectId);
      expect(result[0].status).to.be.equal('online');
      expect(result[0].owner.toString()).to.be.equal(owner.toString());
      expect(result[0].friends).to.be.an('array').to.have.lengthOf(1);
      expect(result[0].friends[0].toString()).to.be.equal(mockFriend.toString());
    });
  });

  describe('#addToSet', () => {
    it('must update without change the selected data when de data is already in the array', async () => {
      const result = await driver.addToSet(config, coll, [{ status: 'online' }, { friends: mockFriend }], owner);
      expect(result).to.have.keys('result', 'message', 'connection');
      expect(result.result).to.have.keys('ok', 'n', 'nModified');
      expect(result.result.ok).to.be.equal(1);
      expect(result.result.n).to.be.equal(1);
      expect(result.result.nModified).to.be.equal(0);
    });

    it('must update with change the selected data when de data is already in the array', async () => {
      const result = await driver.addToSet(config, coll, [{ status: 'online' }, { friends: new ObjectId() }], owner);
      expect(result).to.have.keys('result', 'message', 'connection');
      expect(result.result).to.have.keys('ok', 'n', 'nModified');
      expect(result.result.ok).to.be.equal(1);
      expect(result.result.n).to.be.equal(1);
      expect(result.result.nModified).to.be.equal(1);
    });

    it('must read the previosly modified data', async () => {
      const result = await driver.find(config, coll, [{}], owner);
      expect(result).to.be.an('array').to.have.lengthOf(1);
      expect(result[0]).to.have.keys('_id', 'status', 'owner', 'friends');
      expect(result[0]._id).to.be.an.instanceof(ObjectId);
      expect(result[0].status).to.be.equal('online');
      expect(result[0].owner.toString()).to.be.equal(owner.toString());
      expect(result[0].friends).to.be.an('array').to.have.lengthOf(2);
      expect(result[0].friends[0].toString()).to.be.equal(mockFriend.toString());
    });
  });

  describe('#pull', () => {
    it('must update the selected data', async () => {
      const result = await driver.pull(config, coll, [{ status: 'online' }, { friends: mockFriend }], owner);
      expect(result).to.have.keys('result', 'message', 'connection');
      expect(result.result).to.have.keys('ok', 'n', 'nModified');
      expect(result.result.ok).to.be.equal(1);
      expect(result.result.n).to.be.equal(1);
      expect(result.result.nModified).to.be.equal(1);
    });

    it('must read the previosly modified data', async () => {
      const result = await driver.find(config, coll, [{}], owner);
      expect(result).to.be.an('array').to.have.lengthOf(1);
      expect(result[0]).to.have.keys('_id', 'status', 'owner', 'friends');
      expect(result[0]._id).to.be.an.instanceof(ObjectId);
      expect(result[0].status).to.be.equal('online');
      expect(result[0].owner.toString()).to.be.equal(owner.toString());
      expect(result[0].friends).to.be.an('array').to.have.lengthOf(1);
    });
  });

  describe('#remove', () => {
    it('must remove the selected data', async () => {
      const result = await driver.remove(config, coll, [{ status: 'online' }], owner);
      expect(result).to.have.keys('result', 'message', 'connection');
      expect(result.result).to.have.keys('ok', 'n');
      expect(result.result.ok).to.be.equal(1);
      expect(result.result.n).to.be.equal(1);
    });

    it('must read the previosly modified data', async () => {
      const result = await driver.find(config, coll, [{}], owner);
      expect(result).to.be.an('array').to.have.lengthOf(0);
    });
  });
});
