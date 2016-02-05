var request = require('request');
var fs = require('fs');

function submitZip(form, zip) {
  return new Promise(function(resolve, reject) {
    var body = fs.readFileSync(zip);
  
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
        resolve({ status: response.statusCode === 201 ? "ok!" : "error", message: body });
      }
    });
  });
}

module.exports = submitZip;
