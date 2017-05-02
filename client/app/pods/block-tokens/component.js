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
  classNames: ['block', 'tokens'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),

  didReceiveAttrs() {
    this._super(...arguments);
    
    if (Ember.isBlank(this.get('entry.value'))) {
      this.set('entry.value', []);
    }
  },

  didInsertElement: function() {
    this._super(...arguments);
    
    this.$('ul.tagit').tagit({
      placeholderText: this.get('entry.block.placeholder'),
      allowDuplicates: true,
      removeConfirmation: true,
      allowSpaces: true,
      availableTags: this.get('entry.block.options'),
      afterTagAdded: () => {
        Ember.run.scheduleOnce('afterRender', this, function() {
          this.set('entry.value', this.$('ul.tagit').tagit('assignedTags'));
        });
      },
      afterTagRemoved: () => {
        Ember.run.scheduleOnce('afterRender', this, function() {
          this.set('entry.value', this.$('ul.tagit').tagit('assignedTags'));
        });
      }
    });

    let tagitInput = this.$('ul.tagit input');
    
    tagitInput.attr('id', Ember.guidFor(this.get('entry')));
    
    tagitInput.on('focus', () => {
      this.$('ul.tagit').addClass('tagit-focus');
    });
    
    tagitInput.on('blur', () => {
      this.$('ul.tagit').removeClass('tagit-focus');
    });
  },

  willDestroyElement() {
    this._super(...arguments);

    this.$('ul.tagit').tagit('destroy');
    this.$('ul.tagit input').off('focus');
    this.$('ul.tagit input').off('blur');
  },

  actions: {
    focusEntry: function() {
      this.$('input').focus();
    }
  }
});
