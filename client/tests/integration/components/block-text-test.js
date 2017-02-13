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
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ValueEntry from 'therapy-dog/utils/value-entry';
import Ember from 'ember';

moduleForComponent('block-text', 'Integration | Component | Text block', {
  integration: true
});

let block = Ember.Object.create({
  type: 'text',
  key: 'first-name',
  label: 'First Name',
  required: true
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-text entry=entry}}`);

  assert.equal(this.$('label').text().trim(), 'First Name');
  assert.ok(this.$('.block').hasClass('required'));
});

test('it updates the entry value when text is entered', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-text entry=entry}}`);
  
  this.$('input').val('Someone');
  this.$('input').change();
  
  assert.deepEqual(entry.get('value'), 'Someone');
});

test('it is invalid with no text entered if required', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);

  this.render(hbs`{{block-text entry=entry}}`);
  
  assert.ok(this.$('.block').hasClass('invalid'));
  
  this.$('input').val('Someone');
  this.$('input').change();

  assert.notOk(this.$('.block').hasClass('invalid'));
});
