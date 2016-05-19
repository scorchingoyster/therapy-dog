import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ValueEntry from 'therapy-dog/utils/value-entry';
import Ember from 'ember';

moduleForComponent('block-text', 'Integration | Component | Date block with year precision', {
  integration: true
});

let block = Ember.Object.create({
  type: 'date',
  key: 'year',
  label: 'Year',
  precision: 'year'
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  assert.equal(this.$('label').text().trim(), 'Year');
  assert.equal(this.$('input').val(), '');
});

test('it sets the value', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  this.$('input').val('2016').change();
  
  assert.equal(entry.get('value'), '2016');
});

test('the entry is valid if blank', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  this.$('input').val('').change();
  
  assert.equal(entry.get('value'), '');
  assert.notOk(entry.get('invalid'), 'should be a valid year');
});

test('the entry is invalid for invalid input', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-date entry=entry}}`);

  this.$('input').val('abc').change();
  
  assert.equal(entry.get('value'), 'abc');
  assert.ok(entry.get('invalid'), 'should not be a valid year');

  this.$('input').val('5').change();
  
  assert.equal(entry.get('value'), '5');
  assert.ok(entry.get('invalid'), 'should not be a valid year');
});
