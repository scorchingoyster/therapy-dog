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

function postZip(form, zipFile) {
  return new Promise(function(resolve, reject) {
    var body = fs.readFileSync(zipFile);

    request.post('https://localhost:8443/services/sword/collection/' + form.destination, {
      strictSSL: false,
      body: body,
      headers: {
        'Packaging': 'http://cdr.unc.edu/METS/profiles/Simple',
        'Content-Disposition': 'attachment; filename=package.zip',
        'Content-Type': 'application/zip'
      },
      auth: {
        username: 'depositforms',
        password: 'depositforms',
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

function submitZip(form, submission) {
  return makeZip(submission)
  .then(function(zipFile) {
    return postZip(form, zipFile);
  });
}

module.exports = submitZip;
