import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

// Set rootURL based on the pathname. This is necessary only while we have both forms apps deployed and specific forms are redirected from /forms/<name> to /forms2/<name>. When we complete the transition, rootURL should be set to simply '/forms/'.
let match = window.location.pathname.match(/^(\/forms|\/forms2)($|\/)/);
if (match) {
  Router.reopen({
    rootURL: match[1] + '/'
  });
}

Router.map(function() {
  this.route('deposit', { path: '/:form_id' }, function() {
    this.route('index', { path: '/' });
  });
  this.route('not-found', { path: '/*wildcard' });
});

export default Router;
