import Ember from 'ember';

export default Ember.Route.extend({
  titleToken(model) {
    return model.get('form.title');
  },
  
  deposit: Ember.inject.service(),
  
  model(params) {
    return this.get('deposit').get(params);
  }
});
