const expect = require('chai').expect;
const tools = require('./tools');

const search = {};
const data = {status: 'offline'};
const options = {};
const userMock = 1234;

describe('tools', () => {
  describe('#getData', () => {
    it('must return nothing if the action is query type', () => {
      const argsMock = [search];
      const actionMock = 'find';
      const response = tools.getData(argsMock, actionMock);
      expect(response).to.be.undefined;
    });

    it('must return the first argument if the action is basic and not query type', () => {
      const argsMock = [data];
      const actionMock = 'insert';
      const response = tools.getData(argsMock, actionMock);
      expect(response).to.be.equal(data);
    });

    it('must return the second argument if the action is not basic type', () => {
      const argsMock = [search, data];
      const actionMock = 'set';
      const response = tools.getData(argsMock, actionMock);
      expect(response).to.be.equal(data);
    });
  });

  describe('#getModel', () => {
    describe('must throw an error if', () => {
      it('no models where provided', () => {
        const errMsg = 'It is mandatory to provide models to validate the schema';
        expect(() => tools.getModel({}, 'user')).to.throw(errMsg);
      });

      it('models is not provided as an object', () => {
        const errMsg = 'The model list provided is not an Object';
        expect(() => tools.getModel({models: 'wrong'}, 'user')).to.throw(errMsg);
      });

      it('models is not provided as an object', () => {
        const errMsg = 'Required model does not exists';
        expect(() => tools.getModel({models: {user2:{}}}, 'user')).to.throw(errMsg);
      });
    });

    it('must return the required model if exists', () => {
      const userModelMock = new Object();
      const configMock = { models: {user: userModelMock} };
      const result = tools.getModel(configMock, 'user');
      expect(result).to.be.equal(userModelMock);
    })
  });

  describe('#formatArgs', () => {
    it('must return the arguments unmodified if the action is query type', () => {
      const argsMock = [search, data];
      const actionMock = 'insert';
      const response = tools.formatArgs(argsMock, actionMock);
      expect(response).to.be.equal(argsMock);
      expect(response[1]).to.be.equal(data);
    });

    it('must return the arguments modified if the action is not query type', () => {
      const argsMock = [search, data];
      const actionMock = 'set';
      const response = tools.formatArgs(argsMock, actionMock);
      expect(response).to.be.equal(argsMock);
      expect(response[1]).to.has.key('$set');
      expect(response[1].$set).to.be.equal(data);
    });
  });

  describe('#secureArgs', () => {
    it('must return the arguments unmodified if the model is public', () => {
      const modelMock = {};
      const argsMock  = {};
      const result = tools.secureArgs(modelMock, argsMock);
      expect(result).to.be.equal(argsMock);
    });

    it('must throw an error if the model is private and no owner was defined', () => {
      const modelMock = {private: true};
      const argsMock = [search, data];
      const actionMock = 'set';
      const errMsg = 'An owner must be defined in order to secure the db query';
      expect(() => tools.secureArgs(modelMock, argsMock, actionMock)).to.throw(errMsg);
    });

    it('must return the secured arguments if the action is query type', () => {
      const modelMock = {private: true};
      const argsMock = [search, data];
      const actionMock = 'set';
      const response = tools.secureArgs(modelMock, argsMock, actionMock, userMock);
      expect(response).to.be.equal(argsMock);
      expect(response[0]).to.be.equal(search);
    });

    it('must return the secured arguments if the action is not query type', () => {
      const modelMock = {private: true};
      const argsMock = [search, data];
      const actionMock = 'insert';
      const response = tools.secureArgs(modelMock, argsMock, actionMock, userMock);
      expect(response).to.be.equal(argsMock);
      expect(response[0]).to.has.key('owner');
      expect(response[0].owner).to.be.equal(userMock);
    });
  });

});
