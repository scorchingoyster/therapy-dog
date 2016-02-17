import Ember from 'ember';
import ObjectEntry from '../../utils/object-entry';

export default Ember.Controller.extend({
  entryEvents: Ember.inject.service(),
  
  actions: {
    reset() {
      this.set('model', ObjectEntry.create({ block: this.get('model.block') }));
    },
    
    dump() {
      console.log(JSON.stringify(this.get('model').flatten()));
    },
    
    validate() {
      let model = this.get('model');
      let firstBadEntry;
      
      model.forEach(function(entry) {
        entry.set("attempted", true);
        
        if (entry.get("errors.length") > 0 && !firstBadEntry) {
          firstBadEntry = entry;
        }
      });
      
      if (firstBadEntry) {
        this.get("entryEvents").trigger("focus", firstBadEntry);
      }
    }
  }
});
