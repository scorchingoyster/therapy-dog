import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'text'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  didInsertElement: function() {
    this._super(...arguments);

    let options = this.get('entry.block.options');
    if (Ember.isArray(options)) {
      this.$('.autocomplete').autocomplete({
        source: options
      });
    }
  },

  willDestroyElement() {
    this._super(...arguments);

    let options = this.get('entry.block.options');
    if (Ember.isArray(options)) {
      this.$('.autocomplete').autocomplete('destroy');
    }
  },
  
  focusOut: function() {
    this.set('entry.attempted', true);
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
