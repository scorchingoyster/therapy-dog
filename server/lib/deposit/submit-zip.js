'use strict';

const fs = require('fs');
const Promise = require('bluebird');
const request = require('request');
const archiver = require('archiver');
const tmp = require('tmp');
const config = require('../../config');
const SwordError = require('../errors').SwordError;

function makeZip(submission) {
  return new Promise(function(resolve, reject) {
    tmp.tmpName(function(err, zipFile) {
      /* istanbul ignore next */
      if (err) {
        reject(err);
        return;
      }

      let output = fs.createWriteStream(zipFile);

      output.on('close', function() {
        resolve(zipFile);
      });

      let archive = archiver.create('zip', {});
      archive.pipe(output);

      /* istanbul ignore next */
      archive.on('error', function(err) {
        reject(err);
      });

      Object.keys(submission).forEach(function(name) {
        if (submission[name] instanceof Buffer) {
          archive.append(submission[name], { name: name });
        } else {
          archive.append(fs.createReadStream(submission[name]), { name: name });
        }
      });

      archive.finalize();
    });
  });
}

function postZip(form, zipFile, depositorEmail) {
  return new Promise(function(resolve, reject) {
    let body = fs.readFileSync(zipFile);
    let headers = {
      'Packaging': 'http://cdr.unc.edu/METS/profiles/Simple',
      'Content-Disposition': 'attachment; filename=package.zip',
      'Content-Type': 'application/zip',
      'mail': depositorEmail
    };

    if (form.depositor !== null) {
      headers['On-Behalf-Of'] = form.depositor;

      if (form.isMemberOf !== null) {
        headers.forwardedGroups = form.isMemberOf;
      }
    }

    request.post(form.destination, {
      strictSSL: false,
      body: body,
      baseUrl: config.SWORD_BASE_URL,
      headers: headers,
      auth: {
        username: config.SWORD_USERNAME,
        password: config.SWORD_PASSWORD,
        sendImmediately: true
      }
    }, function(err, response, body) {
      /* istanbul ignore if */
      if (err) {
        // Ignoring ECONNRESETs for the purpose of determining if the deposit failed
        // as SWORD in some containers closes connections in a way that results in this
        // error while the deposit actually succeeds
        if (err.stack.indexOf('ECONNRESET') !== -1 && config.DEBUG !== undefined && config.DEBUG) {
          resolve();
        } else {
          reject(err);
        }
      } else if (response.statusCode !== 201) {
        reject(new SwordError('Received error response from SWORD endpoint', {
          statusCode: response.statusCode,
          body: body
        }));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Generate a zip file from the `submission` and submit it to the {@link Form#destination destination} specified by the `form`.
 * @function
 * @name submitZip
 * @param {Form} form
 * @param {Submission} submission
 * @param {string} depositorEmail
 * @return {Promise}
 */
function submitZip(form, submission, depositorEmail) {
  return makeZip(submission)
  .then(function(zipFile) {
    return postZip(form, zipFile, depositorEmail);
  });
}

module.exports = submitZip;
