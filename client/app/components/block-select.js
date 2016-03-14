import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'select'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),
  
  didReceiveAttrs() {
    this._super(...arguments);
    
    // Default to the first option.
    if (Ember.isBlank(this.get('entry.value'))) {
      this.set('entry.value', this.get('entry.block.options')[0]);
    }
  },
  
  focusOut: function() {
    this.set('entry.attempted', true);
  },
  
  actions: {
    focusEntry: function() {
      this.$('select').focus();
    },
    
    change: function(value) {
      this.set('entry.value', value);
    }
  }
});
