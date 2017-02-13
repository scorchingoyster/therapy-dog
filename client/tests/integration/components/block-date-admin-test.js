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

moduleForComponent('block-text', 'Integration | Component | Date block with admin precision', {
  integration: true
});

let block = Ember.Object.create({
  type: 'date',
  key: 'date',
  label: 'Date',
  precision: 'admin'
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);

  this.render(hbs`{{block-date entry=entry}}`);

  assert.equal(this.$('label').text().trim(), 'Date');
  assert.equal(this.$('input').val(), '');
});

test('it sets the value', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);

  this.render(hbs`{{block-date entry=entry}}`);

  this.$('input').val('2016').change();

  assert.equal(entry.get('value'), '2016');

  this.$('input').val('2016-04').change();

  assert.equal(entry.get('value'), '2016-04');

  this.$('input').val('2016-04-08').change();

  assert.equal(entry.get('value'), '2016-04-08');
});

test('the entry is valid if blank', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);

  this.render(hbs`{{block-date entry=entry}}`);

  this.$('input').val('').change();

  assert.equal(entry.get('value'), '');
  assert.notOk(entry.get('invalid'), 'should be a valid date');
});

test('the entry is invalid for invalid input', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);

  this.render(hbs`{{block-date entry=entry}}`);

  this.$('input').val('abc').change();

  assert.equal(entry.get('value'), 'abc');
  assert.ok(entry.get('invalid'), 'should not be a valid date');

  this.$('input').val('5').change();

  assert.equal(entry.get('value'), '5');
  assert.ok(entry.get('invalid'), 'should not be a valid date');

  this.$('input').val('2005-').change();

  assert.equal(entry.get('value'), '2005-');
  assert.ok(entry.get('invalid'), 'should not be a valid date');

  this.$('input').val('2005-04-').change();

  assert.equal(entry.get('value'), '2005-04-');
  assert.ok(entry.get('invalid'), 'should not be a valid date');
});