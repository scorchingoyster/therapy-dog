'use strict';

const winston = require('winston');
const expressWinston = require('express-winston');
const config = require('../config');

let requestLogger, errorLogger;

if (process.env.NODE_ENV === 'production') {
  let transports = [
    new winston.transports.File({
      level: 'info',
      filename: config.LOG_FILENAME,
      json: false,
      prettyPrint: true
    })
  ];

  winston.clear();

  transports.forEach(function(transport) {
    winston.add(transport, {}, true);
  });

  errorLogger = expressWinston.errorLogger({
    transports: transports
  });
} else {
  winston.clear();

  winston.add(winston.transports.Console, {
    level: 'debug',
    prettyPrint: true,
    colorize: true
  });

  requestLogger = expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: false,
        colorize: true
      })
    ],
    expressFormat: true,
    meta: false
  });

  errorLogger = expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true
      })
    ]
  });
}

module.exports = {
  requestLogger: requestLogger,
  errorLogger: errorLogger,
  error: winston.error,
  warn: winston.warn,
  info: winston.info,
  log: winston.log,
  verbose: winston.verbose,
  debug: winston.debug,
  silly: winston.silly
};
