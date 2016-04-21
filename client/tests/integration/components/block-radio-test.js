import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ValueEntry from 'therapy-dog/utils/value-entry';
import Ember from 'ember';

moduleForComponent('block-radio', 'Integration | Component | Radio block', {
  integration: true
});

let vocabRadioBlock = Ember.Object.create({
  type: 'radio',
  key: 'colors',
  label: 'Primary Colors',
  options: [
    { label: 'Red', value: '#f00' },
    { label: 'Blue', value: '#0f0' },
    { label: 'Yellow', value: '#ff0' }
  ]
});

let defaultValueRadioBlock = Ember.Object.create({
  type: 'radio',
  key: 'colors',
  label: 'Primary Colors',
  options: [
    { label: 'Red', value: '#f00' },
    { label: 'Blue', value: '#0f0' },
    { label: 'Yellow', value: '#ff0' }
  ],
  defaultValue: '#0f0'
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block: vocabRadioBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-radio entry=entry}}`);

  assert.equal(this.$('h2').text().trim(), 'Primary Colors');
  assert.deepEqual(this.$('label').map((i, e) => $(e).text().trim()).get(), ['Red', 'Blue', 'Yellow']);
});

test('it sets the initial value to the first option', function(assert) {
  let entry = ValueEntry.create({ block: vocabRadioBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-radio entry=entry}}`);
  
  assert.ok(this.$('input').get(0).checked);
  assert.deepEqual(entry.get('value'), '#f00');
});

test('it updates the entry value with the "value" property in options when clicked', function(assert) {
  let entry = ValueEntry.create({ block: vocabRadioBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-radio entry=entry}}`);
  
  this.$('input').eq(0).click();
  
  assert.deepEqual(entry.get('value'), '#f00');
  
  this.$('input').eq(1).click();
  
  assert.deepEqual(entry.get('value'), '#0f0');
});

test('it sets the initial value to defaultValue if present', function(assert) {
  let entry = ValueEntry.create({ block: defaultValueRadioBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-radio entry=entry}}`);
  
  assert.ok(this.$('input').get(1).checked);
  assert.deepEqual(entry.get('value'), '#0f0');
});
