import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'agreement'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  focusOut: function() {
    this.set('entry.attempted', true);
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
