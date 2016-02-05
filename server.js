var express = require("express");
var fs = require("fs");
var morgan  = require('morgan');

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

var app = express();

app.use(morgan('dev'));

require('./lib/index')(app);

app.listen(port, ipaddress);
