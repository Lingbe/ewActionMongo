const userSchema = {
  $id       : 'user',
  type      : 'object',
  properties: {
    name   : { type: 'string'  },
    age    : { type: 'integer' },
    friends: { $ref: 'langs'   },
    status : { type: 'string', pattern: '(online|offline)' }
  }
};

const langs = {
  $id  : 'langs',
  type : 'array',
  items: [{ $ref: 'lang' }]
};

const lang = {
  $id       : 'lang',
  type      : 'object',
  properties: {
    code  : { type: 'string', pattern: '[A-Z]{2}' },
    native: { type: 'boolean' },
    level : { type: 'integer' }
  }
};

module.exports = [userSchema, langs, lang];
