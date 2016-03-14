import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'radiobuttons'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  didReceiveAttrs() {
    this._super(...arguments);

    if (!this.get('entry.value')) {
      this.set('entry.value', []);
    }
  },

  focusOut: function() {
    this.set('entry.attempted', true);
  }
});
