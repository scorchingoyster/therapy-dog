'use strict';

const winston = require('winston');
const expressWinston = require('express-winston');
// var winstonMail = require('winston-mail');

let requestLogger, errorLogger;

if (process.env.NODE_ENV === 'production') {
  var transports = [
    new winston.transports.File({
      level: 'info',
      filename: process.env.LOG_FILENAME
    }),
    // new winstonMail.Mail({
    //   to: process.env.ERROR_MAIL_TO,
    //   level: 'error'
    // })
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
