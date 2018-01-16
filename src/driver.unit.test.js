const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const proxyquire = require('proxyquire');

const userSchemaMock = require('./userSchemaMock');
const modelsMock = {'user': {schema: userSchemaMock} };
const configBasicMock = {db: '', models: modelsMock};

const toolsMock = {
  inputValidator : () => true,
  getData        : () => ({data:1}),
  getModel       : () => {},
  schemaValidator: () => true,
  formarArgs     : (args) => args,
  secureArgs     : (model, args) => args,
  formatAction   : (action) => action
};

describe('#driver', () => {
  describe('#find', () => {
    describe('must throw an exception if', () => {
      it('validateInput fails', async () => {
        const driver = proxyquire('./driver', {'./tools':{
          inputValidator: () => { throw new Error('errorMock')}
        }});
        expect(driver.find(configBasicMock)).to.eventually.be.rejectedWith('errorMock');
      });

      it('model seach fails', async () => {
        const driver = proxyquire('./driver', {'./tools':{
          inputValidator : () => true,
          getData        : () => ({data:1}),
          getModel       : () => { throw new Error('errorMock')},
          schemaValidator: () => true,
          formarArgs     : (args) => args
        }});
        expect(driver.find(configBasicMock)).to.eventually.be.rejectedWith('errorMock');
      });

      it('validateSchema fails', async () => {
        const driver = proxyquire('./driver', {'./tools':{
          inputValidator : () => true,
          getData        : () => ({data:1}),
          getModel       : () => {},
          schemaValidator: () => { throw new Error('errorMock')},
          formarArgs     : (args) => args
        }});
        expect(driver.find(configBasicMock, 'user')).to.eventually.be.rejectedWith('errorMock');
      });

      it('secureArgs fails', async () => {
        const driver = proxyquire('./driver', {'./tools':{
          inputValidator : () => true,
          getData        : () => ({data:1}),
          getModel       : () => {},
          schemaValidator: () => true,
          formarArgs     : (args) => args,
          secureArgs     : () => { throw new Error('errorMock')}
        }});
        expect(driver.find(configBasicMock)).to.eventually.be.rejectedWith('errorMock');
      });

      it('mongodb call fails', async () => {
        const errMock = new Error('errorMock');
        const argsMock = [];
        const dbMock = buildMongoDbMock('user', 'find', argsMock, errMock);
        const driver = proxyquire('./driver', {'./tools': toolsMock});
        const configMock = {db: dbMock, models: modelsMock};
        expect(driver.find(configMock, 'user', argsMock, '1234')).to.eventually.be.rejectedWith('errorMock');
      });
    });

    it('must call the mongoDB usign the right collection, action & parameters', async () => {
      const errMock = new Error('errorMock');
      const argsMock = [{user: 123}];
      const dbMock = buildMongoDbMock('user', 'find', argsMock, errMock);
      const driver = proxyquire('./driver', {'./tools': toolsMock});
      const configMock = {db: dbMock, models: modelsMock};
      expect(driver.find(configMock, 'user', argsMock, '1234')).to.eventually.be.rejectedWith('errorMock');
    });
  });
});

function buildMongoDbMock(collMock, method, argsMock, err, success){
  return {collection: collection};

  function collection(coll){
    expect(coll).to.be.equal(collMock);
    return {[method]: actionFn};
  }

  function actionFn(){
    for(let i=0; i<arguments.length-2; i++){
      expect(arguments[i]).to.be.equal(argsMock[i]);
    }
    const callback = argsMock[argsMock.length-1];
    expect(callback).to.be.a('function');
    callback(err, success);
  }
}
