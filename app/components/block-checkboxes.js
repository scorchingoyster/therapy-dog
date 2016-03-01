import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'checkboxes'],
  classNameBindings: ['required', 'invalid'],
  invalid: Ember.computed('entry.errors', 'entry.attempted', function() {
    return !Ember.isEmpty(this.get('entry.errors')) && this.get('entry.attempted');
  }),

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