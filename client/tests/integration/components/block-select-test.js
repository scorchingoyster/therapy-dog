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

moduleForComponent('block-select', 'Integration | Component | Select block', {
  integration: true
});

let vocabSelectBlock = Ember.Object.create({
  type: 'radio',
  key: 'colors',
  label: 'Primary Colors',
  options: [
    { label: 'Red', value: '#f00' },
    { label: 'Blue', value: '#0f0' },
    { label: 'Yellow', value: '#ff0' }
  ]
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block: vocabSelectBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-select entry=entry}}`);

  assert.equal(this.$('label').text().trim(), 'Primary Colors');
  assert.deepEqual(this.$('option').map((i, e) => $(e).text().trim()).get(), ['Red', 'Blue', 'Yellow']);
});
