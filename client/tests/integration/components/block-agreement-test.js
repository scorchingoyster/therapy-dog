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

moduleForComponent('block-agreement', 'Integration | Component | Agreement block', {
  integration: true
});

let block = Ember.Object.create({
  type: 'agreement',
  key: 'agreement',
  name: 'Deposit Agreement',
  uri: 'http://example.com/agreement',
  prompt: 'I agree to the <a href="http://example.com/agreement">agreement</a>.'
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-agreement entry=entry}}`);

  assert.equal(this.$('h2').text().trim(), 'Deposit Agreement');
  assert.equal(this.$('label').text().trim(), 'I agree to the agreement.');
  assert.ok(this.$('.block').hasClass('required'));
});

test('it updates the entry value when clicked', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-agreement entry=entry}}`);
  
  assert.deepEqual(entry.get('value'), false);
  
  this.$('input').eq(0).click();
  
  assert.deepEqual(entry.get('value'), true);
  
  this.$('input').eq(0).click();
  
  assert.deepEqual(entry.get('value'), false);
});

test('it is invalid unless checked', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);

  this.render(hbs`{{block-agreement entry=entry}}`);
  
  assert.ok(this.$('.block').hasClass('invalid'));
  
  this.$('input').eq(0).click();

  assert.notOk(this.$('.block').hasClass('invalid'));
  
  this.$('input').eq(0).click();
  
  assert.ok(this.$('.block').hasClass('invalid'));
});
