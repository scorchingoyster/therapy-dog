import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'select'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),
  
  didReceiveAttrs() {
    this._super(...arguments);
    
    if (Ember.isBlank(this.get('entry.value'))) {
      if (this.get('entry.block.allowBlank')) {
        this.set('entry.value', this.get('entry.block.defaultValue') || '');
      } else {
        let firstOption = this.get('entry.block.options')[0];
        let firstValue = firstOption.value ? firstOption.value : firstOption;
        
        this.set('entry.value', this.get('entry.block.defaultValue') || firstValue);
      }
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
