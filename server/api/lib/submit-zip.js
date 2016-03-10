var fs = require('fs');
var request = require('request');
var Promise = require('promise');
var archiver = require('archiver');
var tmp = require('tmp');

function makeZip(submission) {
  return new Promise(function(resolve, reject) {
    tmp.tmpName(function(err, zipFile) {
      if (err) {
        reject(err);
        return;
      }
    
      var output = fs.createWriteStream(zipFile);

      output.on('close', function() {
        resolve(zipFile);
      });

      var archive = archiver.create('zip', {});
      archive.pipe(output);

      archive.on('error', function(err) {
        reject(err);
      });
      
      Object.keys(submission).forEach(function(name) {
        console.log(submission[name]);
        
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

function postZip(form, zipFile, config) {
  return new Promise(function(resolve, reject) {
    var body = fs.readFileSync(zipFile);
    
    request.post(form.destination, {
      strictSSL: false,
      body: body,
      baseUrl: config.baseUrl,
      headers: {
        'Packaging': 'http://cdr.unc.edu/METS/profiles/Simple',
        'Content-Disposition': 'attachment; filename=package.zip',
        'Content-Type': 'application/zip'
      },
      auth: {
        username: config.username,
        password: config.password,
        sendImmediately: true
      }
    }, function(err, response, body) {
      if (err) {
        reject(err);
      } else {
        resolve({ status: response.statusCode === 201 ? "OK" : "ERROR", message: body });
      }
    });
  });
}

function submitZip(form, submission, config) {
  return makeZip(submission)
  .then(function(zipFile) {
    return postZip(form, zipFile, config);
  });
}

module.exports = submitZip;
