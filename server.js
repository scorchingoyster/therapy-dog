import fs from 'fs';
import express from 'express';
import morgan from 'morgan';
import api from 'api';

let app = express();
app.use(morgan('dev'));
api(app);

let ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
let port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
app.listen(port, ipaddress);
