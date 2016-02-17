import Ember from 'ember';
import ArrayEntry from '../utils/array-entry';
import ObjectEntry from '../utils/object-entry';
import ValueEntry from '../utils/value-entry';

export default Ember.Component.extend({
  didReceiveAttrs() {
    this._super(...arguments);
    
    let block = this.get('entry.block'), value = this.get('entry.value');
    
    if (!value) {
      value = this.set('entry.value', Ember.Object.create());
    }
    
    let entries = block.get('children').map(function(child) {
      let key = child.get('key');
      let entry = value.get(key);
      
      if (!entry) {
        if (child.get('type') === 'section' || child.get('type') === 'form') {
          if (child.get('repeat')) {
            entry = ArrayEntry.create({ block: child });
          } else {
            entry = ObjectEntry.create({ block: child });
          }
        } else {
          entry = ValueEntry.create({ block: child });
        }
        
        value.set(key, entry);
      }
      
      return entry;
    });
    
    this.set('entries', entries);
  }
});
