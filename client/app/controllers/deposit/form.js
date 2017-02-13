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
import ObjectEntry from 'therapy-dog/utils/object-entry';

export default Ember.Controller.extend({
  entryEvents: Ember.inject.service(),
  uploader: Ember.inject.service(),
  deposit: Ember.inject.service(),
  
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
    },
    
    debugDeposit() {
      if (this.validate()) {
        this.get('deposit').debug(this.get('model'))
        .then(function(mets) {
          console.log(mets);
        });
      }
    }
  }
});
