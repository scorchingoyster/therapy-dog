import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ValueEntry from 'therapy-dog/utils/value-entry';
import Ember from 'ember';

moduleForComponent('block-checkboxes', 'Integration | Component | block checkboxes values', {
  integration: true
});

let block = Ember.Object.create({
  type: 'checkboxes',
  key: 'colors',
  label: 'Primary Colors',
  options: [
    { label: 'Red', value: '#f00' },
    { label: 'Blue', value: '#0f0' },
    { label: 'Yellow', value: '#ff0' }
  ]
});

test('it renders the "label" key in options', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);

  assert.deepEqual(this.$('label').map((i, e) => $(e).text().trim()).get(), ['Red', 'Blue', 'Yellow']);
});

test('it updates the entry value with the "value" property in options when clicked', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);
  
  this.$('input').eq(0).click();
  
  assert.deepEqual(entry.get('value'), ['#f00']);
});
