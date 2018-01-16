const { expect } = require('chai');
const actions = require('./actions');

describe('actions', () => {
  describe('#isBasic', () => {
    [{ action: 'find',     expectedResult: true },
      { action: 'insert',   expectedResult: true },
      { action: 'remove',   expectedResult: true },
      { action: 'set',      expectedResult: false },
      { action: 'unset',    expectedResult: false },
      { action: 'push',     expectedResult: false },
      { action: 'pull',     expectedResult: false },
      { action: 'addToSet', expectedResult: false }
    ].forEach((test) => {
      it(`must return ${test.expectedResult} on "${test.action}" action`, () => {
        const result = actions.isBasic(test.action);
        expect(result).to.be.equal(test.expectedResult);
      });
    });
  });

  describe('#isQuery', () => {
    [{ action: 'find',     expectedResult: true },
      { action: 'insert',   expectedResult: false },
      { action: 'remove',   expectedResult: true },
      { action: 'set',      expectedResult: false },
      { action: 'unset',    expectedResult: false },
      { action: 'push',     expectedResult: false },
      { action: 'pull',     expectedResult: false },
      { action: 'addToSet', expectedResult: false },
      { action: 'random',   expectedResult: false }
    ].forEach((test) => {
      it(`must return ${test.expectedResult} on "${test.action}" action`, () => {
        const result = actions.isQuery(test.action);
        expect(result).to.be.equal(test.expectedResult);
      });
    });
  });

  describe('#isArray', () => {
    [{ action: 'find',     expectedResult: false },
      { action: 'insert',   expectedResult: false },
      { action: 'remove',   expectedResult: false },
      { action: 'set',      expectedResult: false },
      { action: 'unset',    expectedResult: false },
      { action: 'push',     expectedResult: true },
      { action: 'pull',     expectedResult: true },
      { action: 'addToSet', expectedResult: true },
      { action: 'random',   expectedResult: false }
    ].forEach((test) => {
      it(`must return ${test.expectedResult} on "${test.action}" action`, () => {
        const result = actions.isArray(test.action);
        expect(result).to.be.equal(test.expectedResult);
      });
    });
  });

  describe('#isValid', () => {
    [{ action: 'find',     expectedResult: true },
      { action: 'insert',   expectedResult: true },
      { action: 'remove',   expectedResult: true },
      { action: 'set',      expectedResult: true },
      { action: 'unset',    expectedResult: true },
      { action: 'push',     expectedResult: true },
      { action: 'pull',     expectedResult: true },
      { action: 'addToSet', expectedResult: true },
      { action: 'random',   expectedResult: false }
    ].forEach((test) => {
      it(`must return ${test.expectedResult} on "${test.action}" action`, () => {
        const result = actions.isValid(test.action);
        expect(result).to.be.equal(test.expectedResult);
      });
    });
  });
});
