import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';
/* globals $ */

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'date'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),
  
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
  
  focusOut: function() {
    // If the date picker is still visible, the user hasn't attempted to enter a value yet.
    if (!$.datepicker._datepickerShowing) {
      this.set('entry.attempted', true);
    }
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
