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

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'email'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  didReceiveAttrs() {
    this._super(...arguments);
    
    if (Ember.isBlank(this.get('entry.value'))) {
      this.set('entry.value', this.get('entry.block.defaultValue') || '');
    }

    if (this.get('entry.block.hide')) {
      this.classNames.push('hide');
    }
  },

  didInsertElement: function() {
    this._super(...arguments);

    let options = this.get('entry.block.options');
    if (Ember.isArray(options)) {
      this.$('.autocomplete').autocomplete({
        source: options
      });
    }
  },

  willDestroyElement() {
    this._super(...arguments);

    let options = this.get('entry.block.options');
    if (Ember.isArray(options)) {
      this.$('.autocomplete').autocomplete('destroy');
    }
  },
  
  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
