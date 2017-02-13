// Copyright 2017 The University of North Carolina at Chapel Hill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import Ember from 'ember';
import ArrayEntry from 'therapy-dog/utils/array-entry';
import ObjectEntry from 'therapy-dog/utils/object-entry';
import ValueEntry from 'therapy-dog/utils/value-entry';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  entryEvents: Ember.inject.service(),
  
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
  },
  
  actions: {
    focusEntry() {
      let first = this.get('entries').get(0);
      
      if (first && first instanceof ValueEntry) {
        this.get('entryEvents').trigger('focus', first);
      }
    }
  }
});
