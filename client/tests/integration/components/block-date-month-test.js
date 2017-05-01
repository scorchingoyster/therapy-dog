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

moduleForComponent('block-text', 'Integration | Component | Date block with month precision', {
  integration: true
});

let block = Ember.Object.create({
  type: 'date',
  key: 'month',
  label: 'Month',
  precision: 'month'
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  assert.equal(this.$('legend').text().trim(), 'Month');
  assert.equal(this.$('select.month').val(), '');
  assert.equal(this.$('input.year').val(), '');
});

test('it sets the value', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  this.$('select.month').val('01').change();
  this.$('input.year').val('2016').change();
  
  assert.equal(entry.get('value'), '2016-01');
});

test('the value is incomplete and the entry is invalid if only the month is selected', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  this.$('select.month').val('01').change();
  
  assert.equal(entry.get('value'), '-01');
  assert.ok(entry.get('invalid'));
});

test('the entry is invalid if only the year is entered', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  this.$('input.year').val('2016').change();
  
  assert.equal(entry.get('value'), '2016-');
  assert.ok(entry.get('invalid'), 'should not be a valid month');
});

test('the entry is invalid for invalid input', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  this.$('select.month').val('01').change();
  this.$('input.year').val('abc').change();
  
  assert.equal(entry.get('value'), 'abc-01');
  assert.ok(entry.get('invalid'), 'should not be a valid month');

  this.$('input.year').val('5').change();
  
  assert.equal(entry.get('value'), '5-01');
  assert.ok(entry.get('invalid'), 'should not be a valid month');
});

test('the entry is invalid if only the month is unselected after being selected', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  this.$('select.month').val('01').change();
  this.$('input.year').val('2016').change();
  
  assert.equal(entry.get('value'), '2016-01');
  assert.notOk(entry.get('invalid'), 'should be a valid month');

  this.$('select.month').val('').change();
  
  assert.equal(entry.get('value'), '2016-');
  assert.ok(entry.get('invalid'), 'should not be a valid month');
});

test('the entry is valid if neither the month or year are selected, even after being selected and unselected', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);
  
  assert.ok(Ember.isEmpty(entry.get('value')), 'should have an empty value');
  assert.notOk(entry.get('invalid'), 'should not be an invalid month');

  this.$('select.month').val('01').change();
  this.$('select.month').val('').change();

  this.$('input.year').val('2016').change();
  this.$('input.year').val('').change();

  assert.ok(Ember.isEmpty(entry.get('value')), 'should have an empty value');
  assert.notOk(entry.get('invalid'), 'should not be an invalid month');
});
