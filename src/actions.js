const queryActions = ['find', 'remove'];
const basicActions = ['insert'].concat(queryActions);
const arrayActions = ['addToSet', 'push', 'pull'];
const validActions = ['set', 'unset'].concat(basicActions).concat(arrayActions);

module.exports = {
  isBasic: isActionType(basicActions),
  isQuery: isActionType(queryActions),
  isValid: isActionType(validActions),
  isArray: isActionType(arrayActions)
};

function isActionType(actionType) {
  return action => actionType.indexOf(action) > -1;
}
