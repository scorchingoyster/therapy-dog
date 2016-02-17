import Ember from 'ember';
import FocusEntryAction from '../mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'text'],
  classNameBindings: ['required'],
  required: Ember.computed.alias('entry.block.required'),
  
  focusOut: function() {
    this.set('entry.attempted', true);
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
