'use strict';

const inherits = require('util').inherits;

const CheckerError = function(message/*, path=[]*/) {
  let path = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;

  this.originalMessage = message;

  if (path.length > 0) {
    this.message = `${message} at ${path.map(i => `[${JSON.stringify(i)}]`).join('')}`;
  } else {
    this.message = message;
  }

  this.path = path;
};
inherits(CheckerError, Error);
exports.CheckerError = CheckerError;

function buildTypeofChecker(type) {
  return function() {
    let checker = function(value) {
      if (typeof value !== type) {
        throw new CheckerError(`Expected ${checker}`);
      }

      return value;
    };

    checker.toString = function() {
      return type;
    };

    return checker;
  };
}

exports.string = buildTypeofChecker('string');

exports.number = buildTypeofChecker('number');

exports.boolean = buildTypeofChecker('boolean');

exports.object = buildTypeofChecker('object');

exports.any = function() {
  let checker = function(value) {
    return value;
  };

  checker.toString = function() {
    return 'any';
  };

  return checker;
};

exports.literal = function(literal) {
  let checker = function(value) {
    if (value !== literal) {
      throw new CheckerError(`Expected ${checker}`);
    }

    return value;
  };

  checker.toString = function() {
    return JSON.stringify(literal);
  };

  return checker;
};

exports.regexp = function(regexp) {
  let checker = function(value) {
    if (typeof value !== 'string' || !value.match(regexp)) {
      throw new CheckerError(`Expected ${checker}`);
    }

    return value;
  };

  checker.toString = function() {
    return regexp.toString();
  };

  return checker;
};

exports.shape = function(spec) {
  let keys = Object.keys(spec);

  let checker = function(value) {
    if (typeof value !== 'object') {
      throw new CheckerError(`Expected object`);
    }

    let result = {};
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];

      try {
        let prop = spec[key](value[key]);

        if (prop !== undefined) {
          result[key] = prop;
        }
      } catch (err) {
        if (err instanceof CheckerError) {
          throw new CheckerError(err.originalMessage, [key].concat(err.path));
        } else {
          throw err;
        }
      }
    }

    return result;
  };

  checker.toString = function() {
    return 'object';
  };

  return checker;
};

exports.array = function() {
  let checker = function(value) {
    if (!Array.isArray(value)) {
      throw new CheckerError(`Expected ${checker}`);
    }

    return value;
  };

  checker.toString = function() {
    return 'array';
  };

  return checker;
};

exports.arrayOf = function(inner) {
  let checker = function(value) {
    if (!Array.isArray(value)) {
      throw new CheckerError(`Expected array`);
    }

    let result = [];
    for (let i = 0; i < value.length; i++) {
      try {
        result[i] = inner(value[i]);
      } catch (err) {
        if (err instanceof CheckerError) {
          throw new CheckerError(err.originalMessage, [i].concat(err.path));
        } else {
          throw err;
        }
      }
    }
    return result;
  };

  checker.toString = function() {
    return 'array';
  };

  return checker;
};

exports.mapOf = function(inner) {
  let checker = function(value) {
    if (typeof value !== 'object') {
      throw new CheckerError(`Expected object`);
    }

    let keys = Object.keys(value);
    let result = {};
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      try {
        result[key] = inner(value[key]);
      } catch (err) {
        if (err instanceof CheckerError) {
          throw new CheckerError(err.originalMessage, [key].concat(err.path));
        } else {
          throw err;
        }
      }
    }
    return result;
  };

  checker.toString = function() {
    return 'object';
  };

  return checker;
};

exports.oneOf = function(types) {
  let checker = function(value) {
    for (let i = 0; i < types.length; i++) {
      try {
        return types[i](value);
      } catch (err) {
        if (err instanceof CheckerError) {
          continue;
        } else {
          throw err;
        }
      }
    }
    throw new CheckerError(`Expected ${checker}`);
  };

  checker.toString = function() {
    return `one of ${types.map(t => t.toString()).join(', ')}`;
  };

  return checker;
};

exports.recordTypes = function(types) {
  let keys = Object.keys(types);

  let checker = function(value) {
    if (typeof value !== 'object') {
      throw new CheckerError(`Expected object`);
    }

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];

      if (value.type === key) {
        return Object.assign({ type: key }, types[key](value));
      }
    }

    throw new CheckerError(`Expected "type" of ${keys.map(k => `"${k}"`).join(', ')}`);
  };

  checker.toString = function() {
    return 'object';
  };

  return checker;
};

exports.optional = function(inner) {
  let checker = function(value) {
    if (value === undefined || value === null) {
      return value;
    }

    return inner(value);
  };

  checker.toString = function() {
    return `optional ${inner}`;
  };

  return checker;
};

exports.lookup = function(checkers, key) {
  let checker = function(value) {
    return checkers[key](value);
  };

  checker.toString = function() {
    return key;
  };

  return checker;
};
