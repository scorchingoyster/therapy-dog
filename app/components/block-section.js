import Ember from 'ember';
import ObjectEntry from 'therapy-dog/utils/object-entry';

export default Ember.Component.extend({
  classNames: ['block', 'section'],
  classNameBindings: ['repeat', 'invalid'],
  repeat: Ember.computed.alias('entry.block.repeat'),
  invalid: Ember.computed('entry.errors', 'entry.attempted', function() {
    return !Ember.isEmpty(this.get('entry.errors')) && this.get('entry.attempted');
  }),
  
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
        this.get('entry.value').pushObject(this.createBlankEntry());
      }
    },
    
    remove(entry) {
      if (this.get('entry.block.repeat')) {
        this.get('entry.value').removeObject(entry);
        
        if (this.get('entry.value.length') === 0) {
          this.get('entry.value').pushObject(this.createBlankEntry());
        }
      }
    }
  }
});
