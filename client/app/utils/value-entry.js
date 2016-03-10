import Ember from 'ember';

export default Ember.Object.extend(Ember.Validations.Mixin, {
  init() {
    let validations = this.get('block.validations');
    
    if (validations && validations.format) {
      if (Ember.typeOf(validations.format) === 'string') {
        validations.format = new RegExp(validations.format);
      } else if (Ember.typeOf(validations.format.with) === 'string') {
        validations.format.with = new RegExp(validations.format.with);
      }
    }
    
    if (validations) {
      this.validations = { value: validations };
    }
    
    this._super(...arguments);
  },
  
  required: Ember.computed('block.validations', function() {
    return Ember.isPresent(this.get('block.validations.presence'));
  }),
  
  invalid: Ember.computed('isValid', 'attempted', function() {
    return !this.get('isValid') && this.get('attempted');
  }),
  
  flatten() {
    return this.get('value');
  },
  
  forEach(iterator) {
    iterator(this);
  }
});
