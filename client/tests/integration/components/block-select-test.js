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
