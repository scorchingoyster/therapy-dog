import Ember from 'ember';
const email_regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export default Ember.Object.extend({
  required: Ember.computed('block.type', 'block.required', function() {
    let type = this.get('block.type');
    let required = this.get('block.required');
    
    if (type === 'agreement') {
      return true;
    } else if (required) {
      return true;
    } else {
      return false;
    }
  }),
  
  invalid: Ember.computed('errors', function() {
    return !Ember.isEmpty(this.get('errors'));
  }),
  
  errors: Ember.computed('block.required', 'block.type', 'value', 'value.[]', function() {
    let type = this.get('block.type');
    let required = this.get('block.required');
    let value = this.get('value');
    
    if (type === 'agreement' && !value) {
      return [`You must agree to the ${this.get('block.name')} before depositing.`];
    } else if (type === 'file' && required && Ember.isEmpty(value)) {
      return [`This file is required.`];
    } else if (type === 'checkboxes' && required && Ember.isEmpty(value)) {
      return [`Please check at least one option.`];
    } else if (required && Ember.isEmpty(value)) {
      return [`This field is required.`];
    } else if (type === 'email' && !email_regex.test(value)) {
      return [`The entered value is not a valid email address.`];
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
