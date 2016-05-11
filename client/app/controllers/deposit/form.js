import Ember from 'ember';
import ObjectEntry from 'therapy-dog/utils/object-entry';

export default Ember.Controller.extend({
  entryEvents: Ember.inject.service(),
  uploader: Ember.inject.service(),
  
  validate() {
    if (this.get('uploader.anyLoading')) {
      return false;
    }
    
    let root = this.get('model.entry');
    let firstBadEntry;
    
    root.forEach(function(entry) {
      if (entry.get("invalid") && !firstBadEntry) {
        firstBadEntry = entry;
      }
    });
    
    if (firstBadEntry) {
      this.get('entryEvents').trigger('focus', firstBadEntry);
      this.set('model.entry.hasInvalidEntries', true);
      return false;
    } else {
      this.set('model.entry.hasInvalidEntries', false);
      return true;
    }
  },
  
  actions: {
    reset() {
      this.set('model.entry', ObjectEntry.create({ block: this.get('model.form') }));
    },
    
    dump() {
      console.log(JSON.stringify(this.get('model.entry').flatten()));
    },
    
    deposit() {
      return this.validate();
    },
    
    validate() {
      this.validate();
    }
  }
});
