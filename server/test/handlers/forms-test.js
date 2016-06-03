'use strict';

const assert = require('assert');
const httpMocks = require('node-mocks-http');
const router = require('../../lib/router');

describe('Forms handler', function() {
  it('should respond with only basic information if there is no remote_user', function(done) {
    let request = httpMocks.createRequest({
      method: 'GET',
      headers: {},
      path: '/forms/article'
    });

    let response = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter
    });

    router.handle(request, response, done);

    response.on('end', function() {
      assert.equal(200, response.statusCode);

      let document = JSON.parse(response._getData());
      assert.equal('article', document.data.id);
      assert.equal('Article Form', document.data.attributes.title);
      assert.equal(undefined, document.data.attributes.children);
      assert.equal(false, document.meta.authorized);

      done();
    });
  });

  it('should respond with all information if there is a remote_user', function(done) {
    let request = httpMocks.createRequest({
      method: 'GET',
      headers: {
        remote_user: 'someone',
        mail: 'someone@example.com'
      },
      path: '/forms/article'
    });

    let response = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter
    });

    router.handle(request, response, done);

    response.on('end', function() {
      assert.equal(200, response.statusCode);

      let document = JSON.parse(response._getData());
      assert.equal('article', document.data.id);
      assert.equal('Article Form', document.data.attributes.title);
      assert.ok(Array.isArray(document.data.attributes.children), 'children attribute should be an array');
      assert.equal(true, document.meta.authorized);
      assert.equal('someone@example.com', document.meta.mail);

      done();
    });
  });

  it('should respond with 404 for a nonexistent form', function(done) {
    let request = httpMocks.createRequest({
      method: 'GET',
      headers: {},
      path: '/forms/qwerty'
    });

    let response = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter
    });

    router.handle(request, response, done);

    response.on('end', function() {
      assert.equal(404, response.statusCode);
      done();
    });
  });
});
