const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const bridge = require('./index');

const emptySendResponseMock = () => 1;
const empmessageMock = {};

const mocks = {
  config : {},
  owner  : 1,
  resolve: {}
};

describe("ewActionMongo", () => {

  describe('must throw an error if ', () => {
    it('must throw an error if sendResponse is not defined', () => {
      const fn = () => bridge(mocks.config)();
      expect(fn).to.throw('sendResponse must be defined');
    });

    it('must throw an error if sendResponse is not a function', () => {
      const fn = () => bridge(mocks.config)(1);
      expect(fn).to.throw('sendResponse must be a function');
    });
  });

  it('must return a function when called', () => {
    const result = bridge(mocks.config)(emptySendResponseMock);
    expect(result).to.be.a('function');
  });
});


describe('mongoEventBridge -> processEvent', () => {

  describe('must throw an error if ', () => {
    it('an empty message is provided', async () => {
      const messageMock = null;
      const processEvent = bridge(mocks.config)(emptySendResponseMock);
      expect(processEvent(messageMock)).to.eventually.be.rejectedWith('Impossible to process empty messages');
    });

    it('the empty message has no type', async () => {
      const messageMock = {};
      const processEvent = bridge(mocks.config)(emptySendResponseMock);
      expect(processEvent(messageMock)).to.eventually.be.rejectedWith('Message must be an object and have the attribute .type');
    });

    it('the empty message has no payload', async () => {
      const messageMock = {type:'type'};
      const processEvent = bridge(mocks.config)(emptySendResponseMock);
      expect(processEvent(messageMock)).to.eventually.be.rejectedWith('Message must be an object and have the attribute .payload');
    });

    it('the type is not valid', async () => {
      const messageMock = {type:'user', payload: 'payload'};
      const processEvent = bridge(mocks.config)(emptySendResponseMock);
      expect(processEvent(messageMock)).to.eventually.be.rejectedWith('Message .type is not valid for mongoEventBridge');
    });

    it('the mongoBridgeDriver action fails', async () => {
      const errorMessageMock = 'error';
      const errorMock = new Error(errorMessageMock);
      const sendResponse = sinon.spy();
      const action = sinon.stub().throws(errorMock);
      const driver = {find:action};

      const bridge = proxyquire('./index', {'./driver': driver});
      const mockPayload = [{_id: 1}];
      const messageMock = {
        type   :'user/find',
        payload: mockPayload,
        owner  : mocks.owner
      };
      const processEvent = bridge(mocks.config)(sendResponse);
      await processEvent(messageMock);

      expect(action.calledOnce).to.be.equal(true);
      expect(action.args[0][0]).to.be.equal(mocks.config);
      expect(action.args[0][1]).to.be.equal('user');
      expect(action.args[0][2]).to.be.equal(mockPayload);
      expect(action.args[0][3]).to.be.equal(mocks.owner);
      expect(sendResponse.calledOnce).to.be.equal(true);
      expect(sendResponse.args[0][0]).to.be.an('object');
      expect(sendResponse.args[0][0].status).to.be.equal("fail");
      expect(sendResponse.args[0][0].payload).to.be.equal(errorMessageMock);
    });
  });

  describe('must process a find message', () => {

    it('with broad format', async () => {
      const sendResponse = sinon.spy();
      const responseMock = new Object();
      const action = sinon.stub().returns(responseMock);
      const driver = {find: action};//sinon.stub().returns(action);

      const bridge = proxyquire('./index', {'./driver': driver});
      const mockPayload = [{_id: 1}];
      const messageMock = {
        type   :'user/find',
        payload: mockPayload,
        owner  : mocks.owner
      };
      const processEvent = bridge(mocks.config)(sendResponse);
      await processEvent(messageMock);

      // expect(driver.withArgs('find').calledOnce).to.be.equal(true);
      expect(action.calledOnce).to.be.equal(true);
      expect(action.args[0][0]).to.be.equal(mocks.config);
      expect(action.args[0][1]).to.be.equal('user');
      expect(action.args[0][2]).to.be.equal(mockPayload);
      expect(action.args[0][3]).to.be.equal(mocks.owner);
      expect(sendResponse.calledOnce).to.be.equal(true);
      expect(sendResponse.args[0][0]).to.be.an('object');
      expect(sendResponse.args[0][0].status).to.be.equal("response");
      expect(sendResponse.args[0][0].payload).to.be.equal(responseMock);
    });

    it('with specific format', async () => {
      const sendResponse = sinon.spy();
      const responseMock = new Object();
      const action = sinon.stub().returns(responseMock);
      const driver = {find: action};

      const bridge = proxyquire('./index', {'./driver': driver});
      const mockPayload = 'online';
      const messageMock = {
        type   :'user/find/status',
        payload: mockPayload,
        owner  : mocks.owner
      };
      const processEvent = bridge(mocks.config)(sendResponse);
      await processEvent(messageMock);

      expect(action.calledOnce).to.be.equal(true);
      expect(action.args[0][0]).to.be.equal(mocks.config);
      expect(action.args[0][1]).to.be.equal('user');
      expect(action.args[0][2]).to.be.an('Array').to.have.lengthOf(1);
      expect(action.args[0][2][0]).to.be.an('Object');
      expect(action.args[0][2][0]).to.have.key('status');
      expect(action.args[0][2][0].status).to.be.equal(mockPayload);
      expect(action.args[0][3]).to.be.equal(mocks.owner);
      expect(sendResponse.calledOnce).to.be.equal(true);
      expect(sendResponse.args[0][0]).to.be.an('object');
      expect(sendResponse.args[0][0].status).to.be.equal("response");
      expect(sendResponse.args[0][0].payload).to.be.equal(responseMock);
    });
  });

  describe('must process a set message', () => {

    it('with broad format', async () => {
      const sendResponse = sinon.spy();
      const responseMock = new Object();
      const action = sinon.stub().returns(responseMock);
      const driver = {set:action};

      const bridge = proxyquire('./index', {'./driver': driver});
      const mockPayload = [{_id: 1}, {status: 'offline'}];
      const messageMock = {
        type   :'user/set',
        payload: mockPayload,
        owner  : mocks.owner
      };
      const processEvent = bridge(mocks.config)(sendResponse);
      await processEvent(messageMock);

      expect(action.calledOnce).to.be.equal(true);
      expect(action.args[0][0]).to.be.equal(mocks.config);
      expect(action.args[0][1]).to.be.equal('user');
      expect(action.args[0][2]).to.be.equal(mockPayload);
      expect(action.args[0][3]).to.be.equal(mocks.owner);
      expect(sendResponse.calledOnce).to.be.equal(true);
      expect(sendResponse.args[0][0]).to.be.an('object');
      expect(sendResponse.args[0][0].status).to.be.equal("response");
      expect(sendResponse.args[0][0].payload).to.be.equal(responseMock);
    });

    it('with specific format', async () => {
      const sendResponse = sinon.spy();
      const responseMock = new Object();
      const action = sinon.stub().returns(responseMock);
      const driver = {set: action};

      const bridge = proxyquire('./index', {'./driver': driver});
      const mockPayload = 'online';
      const messageMock = {
        type   :'user/set/status',
        payload: mockPayload,
        owner  : mocks.owner
      };
      const processEvent = bridge(mocks.config)(sendResponse);
      var response = await processEvent(messageMock);

      expect(action.calledOnce).to.be.equal(true);
      expect(action.args[0][0]).to.be.equal(mocks.config);
      expect(action.args[0][1]).to.be.equal('user');
      expect(action.args[0][2]).to.be.an('Array').to.have.lengthOf(1);
      expect(action.args[0][2][0]).to.be.an('Object');
      expect(action.args[0][2][0]).to.have.key('status');
      expect(action.args[0][2][0].status).to.be.equal(mockPayload);
      expect(action.args[0][3]).to.be.equal(mocks.owner);
      expect(sendResponse.calledOnce).to.be.equal(true);
      expect(sendResponse.args[0][0]).to.be.an('object');
      expect(sendResponse.args[0][0].status).to.be.equal("response");
      expect(sendResponse.args[0][0].payload).to.be.equal(responseMock);
    });
  });

});
