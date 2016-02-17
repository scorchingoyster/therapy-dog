import Ember from 'ember';
import ObjectEntry from '../utils/object-entry';

export default Ember.Route.extend({
  model(params) {
    let promise = this.store.findRecord('form', params.form_id).then(function(form) {
      return Ember.Object.create({
        form: form,
        entry: ObjectEntry.create({ block: form })
      });
    });
    
    let proxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin).create({ promise });
    
    return proxy;
  },
  
  afterModel() {
    this.transitionTo('deposit.form');
  }
});
