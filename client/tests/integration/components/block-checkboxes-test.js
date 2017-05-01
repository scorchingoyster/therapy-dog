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

moduleForComponent('block-checkboxes', 'Integration | Component | Checkboxes block', {
  integration: true
});

let vocabCheckboxesBlock = Ember.Object.create({
  type: 'checkboxes',
  key: 'colors',
  label: 'Primary Colors',
  options: [
    { label: 'Red', value: '#f00' },
    { label: 'Blue', value: '#0f0' },
    { label: 'Yellow', value: '#ff0' }
  ]
});

let requiredCheckboxesBlock = Ember.Object.create({
  type: 'checkboxes',
  key: 'colors',
  label: 'Primary Colors',
  options: [
    { label: 'Red', value: 'Red' },
    { label: 'Blue', value: 'Blue' },
    { label: 'Yellow', value: 'Yellow' }
  ],
  required: true
});

let defaultValueCheckboxesBlock = Ember.Object.create({
  type: 'checkboxes',
  key: 'colors',
  label: 'Primary Colors',
  options: [
    { label: 'Red', value: 'Red' },
    { label: 'Blue', value: 'Blue' },
    { label: 'Yellow', value: 'Yellow' }
  ],
  defaultValue: ['Red', 'Blue']
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block: vocabCheckboxesBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);

  assert.equal(this.$('h2').text().trim(), 'Primary Colors');
  assert.deepEqual(this.$('label').map((i, e) => $(e).text().trim()).get(), ['Red', 'Blue', 'Yellow']);
});

test('it sets the initial value to the empty array', function(assert) {
  let entry = ValueEntry.create({ block: vocabCheckboxesBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);
  
  assert.deepEqual(entry.get('value'), []);
});

test('it sets the initial value to the default value if present', function(assert) {
  let entry = ValueEntry.create({ block: defaultValueCheckboxesBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);
  
  assert.deepEqual(entry.get('value'), ['Red', 'Blue']);
  assert.ok(this.$('input').get(0).checked);
  assert.ok(this.$('input').get(1).checked);
});

test('it updates the entry value with the "value" property in options when clicked', function(assert) {
  let entry = ValueEntry.create({ block: vocabCheckboxesBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);
  
  assert.deepEqual(entry.get('value'), []);
  
  this.$('input').eq(0).click();
  
  assert.deepEqual(entry.get('value'), ['#f00']);
  
  this.$('input').eq(1).click();
  
  assert.deepEqual(entry.get('value'), ['#f00', '#0f0']);
  
  this.$('input').eq(0).click();
  
  assert.deepEqual(entry.get('value'), ['#0f0']);
});

test('it renders with the required class if required', function(assert) {
  let entry = ValueEntry.create({ block: requiredCheckboxesBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);
  
  assert.ok(this.$('.block').hasClass('required'));
});

test('it is invalid with nothing checked if required', function(assert) {
  let entry = ValueEntry.create({ block: requiredCheckboxesBlock });
  this.set('entry', entry);

  this.render(hbs`{{block-checkboxes entry=entry}}`);

  assert.ok(this.$('.block').hasClass('invalid'));
  
  this.$('input').eq(0).click();

  assert.notOk(this.$('.block').hasClass('invalid'));
});
