import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('forms', { path: '/' });
  this.route('deposit', { path: '/:form_id' }, function() {
    this.route('form');
    this.route('result');
  });
});

export default Router;
