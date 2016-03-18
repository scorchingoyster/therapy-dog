import Ember from 'ember';
/* globals $ */

export default Ember.Route.extend({
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
      
      let promise = $.ajax('/api/deposits', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload)
      });
      
      let proxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin).create({ promise });
      
      this.modelFor('deposit').set('result', proxy);
      this.transitionTo('deposit.result');
    }
  }
});
