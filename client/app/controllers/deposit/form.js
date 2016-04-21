import Ember from 'ember';
import ObjectEntry from 'therapy-dog/utils/object-entry';

export default Ember.Controller.extend({
  entryEvents: Ember.inject.service(),
  uploader: Ember.inject.service(),
  
  validate() {
    if (this.get('uploader.anyLoading')) {
      return false;
    }
    
    let model = this.get('model');
    let firstBadEntry;
    
    model.forEach(function(entry) {
      if (entry.get("invalid") && !firstBadEntry) {
        firstBadEntry = entry;
      }
    });
    
    if (firstBadEntry) {
      this.get('entryEvents').trigger('focus', firstBadEntry);
      this.set('model.hasInvalidEntries', true);
      return false;
    } else {
      this.set('model.hasInvalidEntries', false);
      return true;
    }
  },
  
  actions: {
    reset() {
      this.set('model', ObjectEntry.create({ block: this.get('model.block') }));
    },
    
    dump() {
      console.log(JSON.stringify(this.get('model').flatten()));
    },
    
    deposit() {
      return this.validate();
    },
    
    validate() {
      this.validate();
    }
  }
});
