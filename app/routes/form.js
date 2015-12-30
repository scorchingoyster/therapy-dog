import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('form', params.form_id);
  },
  
  setupController(controller, model) {
    this._super(controller, model);
    
    controller.set("entry", model.blankEntry());
  }
});
