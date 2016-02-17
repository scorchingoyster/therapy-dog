import Ember from 'ember';

export default Ember.Object.extend({
  errors: Ember.computed(function() {
    return [];
  }),
  
  flatten() {
    let value = this.get('value');
    
    return Object.keys(value).reduce(function(hash, key) {
      hash[key] = value.get(key).flatten();
      return hash;
    }, {});
  },
  
  forEach(iterator) {
    iterator(this);
    
    let value = this.get('value');
    
    Object.keys(value).forEach(function(key) {
      value.get(key).forEach(iterator);
    });
  }
});
