import Ember from 'ember';
import ObjectEntry from 'therapy-dog/utils/object-entry';

export default Ember.Component.extend({
  entryEvents: Ember.inject.service(),
  
  classNames: ['block', 'section'],
  classNameBindings: ['repeat'],
  repeat: Ember.computed.alias('entry.block.repeat'),
  
  didReceiveAttrs() {
    this._super(...arguments);
    
    if (this.get('entry.block.repeat')) {
      if (!this.get('entry.value')) {
        this.set('entry.value', [this.createBlankEntry()]);
      }
    }
  },
  
  createBlankEntry() {
    return ObjectEntry.create({
      block: this.get('entry.block')
    });
  },
  
  actions: {
    add() {
      if (this.get('entry.block.repeat')) {
        let entry = this.createBlankEntry();
        this.get('entry.value').pushObject(entry);
        
        Ember.run.next(this, function() {
          this.get('entryEvents').trigger('focus', entry);
        });
      }
    },
    
    remove(entry) {
      if (this.get('entry.block.repeat')) {
        // Look for an entry to focus after removing this one.
        let entries = this.get('entry.value');
        let index = entries.indexOf(entry);
        
        // If there is an entry after the one we're removing, focus that.
        // Otherwise, if there is one before, focus that.
        let focusEntry = entries.get(index + 1) || entries.get(index - 1);
        
        entries.removeObject(entry);
        
        // If we found an entry to focus, do that.
        // Otherwise, focus the "Add" button.
        if (focusEntry) {
          Ember.run.next(this, function() {
            this.get('entryEvents').trigger('focus', focusEntry);
          });
        } else {
          Ember.run.next(this, function() {
            this.$('.add button').focus();
          });
        }
      }
    }
  }
});
