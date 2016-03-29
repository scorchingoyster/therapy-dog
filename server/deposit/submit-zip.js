'use strict';

const fs = require('fs');
const request = require('request');
const archiver = require('archiver');
const tmp = require('tmp');

function makeZip(submission) {
  return new Promise(function(resolve, reject) {
    tmp.tmpName(function(err, zipFile) {
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

function postZip(form, zipFile) {
  return new Promise(function(resolve, reject) {
    let body = fs.readFileSync(zipFile);

    request.post(form.destination, {
      strictSSL: false,
      body: body,
      baseUrl: process.env.DEPOSIT_BASE_URL,
      headers: {
        'Packaging': 'http://cdr.unc.edu/METS/profiles/Simple',
        'Content-Disposition': 'attachment; filename=package.zip',
        'Content-Type': 'application/zip'
      },
      auth: {
        username: process.env.DEPOSIT_USERNAME,
        password: process.env.DEPOSIT_PASSWORD,
        sendImmediately: true
      }
    }, function(err, response, body) {
      if (err) {
        reject(err);
      } else {
        resolve({ status: response.statusCode === 201 ? 'OK' : 'ERROR', message: body });
      }
    });
  });
}

function submitZip(form, submission) {
  return makeZip(submission)
  .then(function(zipFile) {
    return postZip(form, zipFile);
  });
}

module.exports = submitZip;
