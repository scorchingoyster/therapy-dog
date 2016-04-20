import Ember from 'ember';
import ENV from 'therapy-dog/config/environment';
/* globals $ */

export default Ember.Route.extend({
  title: function() {
    return this.modelFor('deposit').get('form.title');
  },
  
  model() {
    return this.modelFor('deposit').get('entry');
  },
  
  setupController(controller) {
    this._super(...arguments);
    controller.set('form', this.modelFor('deposit').get('form'));
  },
  
  actions: {
    deposit() {
      let payload = {
        form: this.modelFor('deposit').get('form.id'),
        values: this.modelFor('deposit').get('entry').flatten()
      };
      
      let promise = new Ember.RSVP.Promise(function(resolve, reject) {
        let headers = {};
        if (ENV.APP.spoofRemoteUser) {
          headers['remote_user'] = ENV.APP.spoofRemoteUser;
        }
        
        $.ajax('/' + ENV.APP.apiNamespace + '/deposits', {
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(payload),
          headers
        })
        .done(function(data) {
          resolve(data);
        })
        .fail(function() {
          reject();
        });
      });
      
      let proxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin).create({ promise });
      
      this.modelFor('deposit').set('result', proxy);
      this.transitionTo('deposit.result');
    }
  }
});
