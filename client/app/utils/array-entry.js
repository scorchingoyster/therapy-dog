import Ember from 'ember';

export default Ember.Object.extend({
  isValid: Ember.computed(function() {
    return true;
  }),
  
  flatten() {
    let value = this.get('value');
    
    return value.map(function(item) {
      return item.flatten();
    });
  },
  
  forEach(iterator) {
    iterator(this);
    
    let value = this.get('value');
    
    value.forEach(function(item) {
      item.forEach(iterator);
    });
  }
});
