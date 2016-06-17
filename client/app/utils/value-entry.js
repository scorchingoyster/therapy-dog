import Ember from 'ember';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const DATE_DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MONTH_REGEX = /^\d{4}-\d{2}$/;
const DATE_YEAR_REGEX = /^\d{4}$/;
const DURATION_REGEX = /^P(\d+[a-zA-Z])+$/;

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
  
  errors: Ember.computed('block.required', 'block.type', 'block.precision', 'value', 'value.[]', function() {
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
    } else if (type === 'email' && !Ember.isEmpty(value) && !EMAIL_REGEX.test(value)) {
      return [`The entered value is not a valid email address.`];
    } else if (type === 'date') {
      let precision = this.get('block.precision');
      
      // Duration date valid according to pattern 
      if (DURATION_REGEX.test(value)) {
        return [];
      }

      // A date is invalid if it is not blank and does not match the pattern corresponding to the block's precision property.
      if (precision === 'year' && !Ember.isEmpty(value) && !DATE_YEAR_REGEX.test(value)) {
        return [`Please enter a valid year.`];
      } else if (precision === 'month' && !Ember.isEmpty(value) && !DATE_MONTH_REGEX.test(value)) {
        return [`Please enter a valid month.`];
      } else if ((precision === 'day' || Ember.isEmpty(precision)) && !Ember.isEmpty(value) && !DATE_DAY_REGEX.test(value)) {
        return [`Please enter a valid date.`];
      }
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
