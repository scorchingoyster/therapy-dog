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
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';
/* globals $ */

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'date'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  didReceiveAttrs() {
    this._super(...arguments);

    if (Ember.isBlank(this.get('entry.value'))) {
      this.set('entry.value', this.get('entry.block.defaultValue') || '');
    }
  },

  supportsDateInput: Ember.computed(function() {
    var test = document.createElement('input');
    test.type = 'date';
    return test.type === 'date';
  }),

  precision: Ember.computed('entry.block.precision', function() {
    let precision = this.get('entry.block.precision');
    if (Ember.isEmpty(precision)) {
      return 'day';
    } else {
      return precision;
    }
  }),
  
  didInsertElement: function() {
    this._super(...arguments);
    this.$('input.datepicker').datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat: $.datepicker.ISO_8601
    });
  },
  
  willDestroyElement() {
    this._super(...arguments);
    this.$('input.datepicker').datepicker('destroy');
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    },
    
    change: function(value) {
      this.set('entry.value', value);
    }
  }
});
