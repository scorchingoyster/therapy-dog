'use strict';

const SMTPServer = require('smtp-server').SMTPServer;

let server = new SMTPServer({
  disabledCommands: ['AUTH', 'STARTTLS'],
  onData: function(stream, session, callback) {
    stream.pipe(process.stdout);
    stream.on('end', callback);
  }
});

server.listen(1025);
