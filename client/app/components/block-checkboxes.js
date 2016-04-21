import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'checkboxes'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  didReceiveAttrs() {
    this._super(...arguments);

    if (Ember.isBlank(this.get('entry.value'))) {
      this.set('entry.value', this.get('entry.block.defaultValue') || []);
    }
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').first().focus();
    }
  }
});
