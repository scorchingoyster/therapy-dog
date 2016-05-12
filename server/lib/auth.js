'use strict';

exports.getRemoteUser = function(req, res, next) {
  let remoteUser = req.headers['remote_user'];

  if (remoteUser) {
    req.remoteUser = remoteUser;
  }

  next();
};

exports.requireRemoteUser = function(req, res, next) {
  if (req.remoteUser) {
    next();
  } else {
    res.status(401);
    res.send({ errors: [{ status: '401', title: 'Unauthorized' }] });
  }
};
