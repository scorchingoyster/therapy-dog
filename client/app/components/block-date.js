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
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
