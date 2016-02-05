import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return Ember.Object.create({
      form: this.store.findRecord('form', params.form_id),
      value: Ember.Object.create()
    });
  },
  
  afterModel() {
    this.transitionTo('deposit.form');
  }
});
