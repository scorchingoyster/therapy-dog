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

export default Ember.Component.extend({
  classNames: ['month-input'],
  
  value: Ember.computed('year', 'month', {
    get() {
      let { year, month } = this.getProperties('year', 'month');
      
      if (Ember.isEmpty(year) && Ember.isEmpty(month)) {
        return '';
      } else {
        return (year || '') + '-' + (month || '');
      }
    },
    
    set(key, value) {
      if (Ember.typeOf(value) === 'string') {
        let [year, month] = value.split('-');
        this.set('year', year || '');
        this.set('month', month || '');
      } else {
        this.set('year', '');
        this.set('month', '');
      }
    }
  }),
  
  actions: {
    setMonth: function(month) {
      this.set('month', month);
    },
    setYear: function(year) {
      this.set('year', year);
    },
  }
});
