import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'text'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.block.required'),
  invalid: Ember.computed('entry.errors', 'entry.attempted', function() {
    return !Ember.isEmpty(this.get('entry.errors')) && this.get('entry.attempted');
  }),
  
  focusOut: function() {
    this.set('entry.attempted', true);
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
