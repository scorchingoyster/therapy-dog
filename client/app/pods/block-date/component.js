import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';
/* globals $ */

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'date'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  supportsDateInput: Ember.computed(function() {
    var test = document.createElement('input');
    test.type = 'date';
    return test.type === 'date';
  }),

  precision: Ember.computed('entry.block.precision', function() {
    let precision = this.get('entry.block.precision');
    if (Ember.isEmpty(precision)) {
      return 'day';
    } else {
      return precision;
    }
  }),
  
  didInsertElement: function() {
    this._super(...arguments);
    this.$('input.datepicker').datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat: $.datepicker.ISO_8601
    });
  },
  
  willDestroyElement() {
    this._super(...arguments);
    this.$('input.datepicker').datepicker('destroy');
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    },
    
    change: function(value) {
      this.set('entry.value', value);
    }
  }
});
