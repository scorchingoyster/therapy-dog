import Ember from 'ember';

export default Ember.Object.extend({
  errors: Ember.computed('block', 'value', function() {
    var block = this.get('block'), value = this.get('value');

    if (block.get('type') === 'text' && block.get('required') && Ember.isBlank(value)) {
      return ['This field is required.'];
    } else {
      return [];
    }
  }),
  
  flatten() {
    return this.get('value');
  },
  
  forEach(iterator) {
    iterator(this);
  }
});
