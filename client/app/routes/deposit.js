import Ember from 'ember';
import ObjectEntry from 'therapy-dog/utils/object-entry';

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('form', params.form_id).then(function(form) {
      return Ember.Object.create({
        form: form,
        entry: ObjectEntry.create({ block: form })
      });
    });
  },
  
  afterModel() {
    this.transitionTo('deposit.form');
  }
});
