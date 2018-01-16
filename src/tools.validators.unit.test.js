const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { expect } = chai;

const validators     = require('./tools.validators');
const userSchemaMock = require('./userSchemaMock');

describe('tools#validators', () => {
  describe('#input', () => {
    describe('must throw an exception if', () => {
      it('db parameter is falsy', async () => {
        const err = 'mongo connection must be defined';
        expect(validators.input()).to.eventually.be.rejectedWith(err);
      });

      it('collection parameter is falsy', () => {
        const err = 'imposible to exectute mongoDB action if the collection was not specified';
        expect(validators.input('db')).to.eventually.be.rejectedWith(err);
      });

      describe('action parameter', () => {
        it('is not valid', () => {
          const err = 'imposible to exectute mongoDB action if the action was not specified';
          expect(validators.input('db', 'coll', [])).to.eventually.be.rejectedWith(err);
        });

        it('is falsy', () => {
          const err = 'imposible to exectute mongoDB action because the action none is not valid';
          expect(validators.input('db', 'coll', [], 'none')).to.eventually.be.rejectedWith(err);
        });
      });

      describe('args parameter', () => {
        it('is falsy', () => {
          const err = 'imposible to exectute mongoDB action if no arguments were specified';
          expect(validators.input('db', 'coll')).to.eventually.be.rejectedWith(err);
        });

        it('is not an array', () => {
          const err = 'mongoDB query arguments must be an array';
          expect(validators.input('db', 'coll', 'args', 'find')).to.eventually.be.rejectedWith(err);
        });

        it('has more that 3 items', () => {
          const err = 'too many arguments were defined in a mongoDB query';
          expect(validators.input('db', 'coll', [1, 2, 3, 4], 'push')).to.eventually.be.rejectedWith(err);
        });

        it('is an empty array', () => {
          const err = 'no arguments were defined in a mongoDB query';
          expect(validators.input('db', 'coll', [], 'find')).to.eventually.be.rejectedWith(err);
        });

        it('has more that 3 items', () => {
          const err = 'too many arguments were defined in a mongoDB query';
          expect(validators.input('db', 'coll', [1, 2, 3, 4], 'find')).to.eventually.be.rejectedWith(err);
        });

        it('has more that 2 items and the it is performing a basic action', () => {
          const err = 'a mongoDB query for a basic action () can\'t have 3 arguments';
          expect(validators.input('db', 'coll', [1, 2, 3], 'find')).to.eventually.be.rejectedWith(err);
        });
      });
    });
  });

  describe('#schema', () => {
    describe('must throw an error if', () => {
      it('the schema does not exists', () => {
        const mockModels = { model1: {} };
        const errMsg = 'The schema does not exists';
        expect(() => validators.schema({ models: mockModels }, 'user', { data: true })).to.throw(errMsg);
      });

      it('if the validation fails', () => {
        const modelMock = { schema: userSchemaMock };
        const errMsg = '.status should match pattern "(online|offline)"';
        expect(() => validators.schema(modelMock, 'user', { status: 'wrong value' })).to.throw(errMsg);
      });
    });

    it('must return true if the validation worked correctly', () => {
      const modelMock = { schema: userSchemaMock };
      const result = validators.schema(modelMock, 'user', { status: 'online' });
      expect(result).to.be.equal(true);
    });
  });

  describe('#action', () => {
    describe('must return true if', () => {
      it('no actions parameter was defined in the model', () => {
        const modelMock = { schema: userSchemaMock };
        const result = validators.action(modelMock, 'insert', { status: 'online' });
        expect(result).to.be.equal(true);
      });

      it('the used action parameter was defined in the model', () => {
        const modelMock = { schema: userSchemaMock, actions: ['insert'] };
        const result = validators.action(modelMock, 'insert');
        expect(result).to.be.equal(true);
      });
    });

    it('must return false if the used action parameter was not defined in the model', () => {
      const modelMock = { schema: userSchemaMock, actions: ['find'] };
      const result = validators.action(modelMock, 'insert');
      expect(result).to.be.equal(false);
    });
  });
});
