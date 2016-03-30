import Ember from 'ember';

export default Ember.Route.extend({
  title: 'Forms',
  
  model() {
    return this.store.findAll('form');
  }
});
