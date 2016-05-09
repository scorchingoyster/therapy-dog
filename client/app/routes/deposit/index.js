import Ember from 'ember';
import ENV from 'therapy-dog/config/environment';
/* globals $ */

export default Ember.Route.extend({
  renderTemplate: function(controller, model) {
    if (model.get('authorized')) {
      this.render('deposit/form', { model });
    } else {
      this.render('deposit/login');
    }
  },
  
  actions: {
    deposit() {
      let deposit = this.modelFor('deposit');
      
      let payload = {
        form: deposit.get('form.id'),
        values: deposit.get('entry').flatten()
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
          resolve({ status: 'ERROR' });
        });
      });
      
      this.render('deposit/loading');
      
      promise
      .then((result) => {
        deposit.set('result', result);
        this.render('deposit/result', { model: deposit });
      });
    }
  }
});
