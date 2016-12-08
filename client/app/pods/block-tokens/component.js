import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'tokens'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  didReceiveAttrs() {
    this._super(...arguments);
    
    if (Ember.isBlank(this.get('entry.value'))) {
      this.set('entry.value', []);
    }
  },

  didInsertElement: function() {
    this._super(...arguments);
    
    this.$('ul.tagit').tagit({
      placeholderText: this.get('entry.block.placeholder'),
      allowDuplicates: true,
      removeConfirmation: true,
      allowSpaces: true,
      availableTags: this.get('entry.block.options'),
      afterTagAdded: (event, ui) => {
        Ember.run.scheduleOnce('afterRender', this, function() {
          this.set('entry.value', this.$('ul.tagit').tagit('assignedTags'));
        });
      },
      afterTagRemoved: (event, ui) => {
        Ember.run.scheduleOnce('afterRender', this, function() {
          this.set('entry.value', this.$('ul.tagit').tagit('assignedTags'));
        });
      }
    });

    this.$('ul.tagit input').on('focus', () => {
      this.$('ul.tagit').addClass('tagit-focus');
    });
    
    this.$('ul.tagit input').on('blur', () => {
      this.$('ul.tagit').removeClass('tagit-focus');
    });
  },

  willDestroyElement() {
    this._super(...arguments);

    this.$('ul.tagit').tagit('destroy');
    this.$('ul.tagit input').off('focus');
    this.$('ul.tagit input').off('blur');
  },

  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
