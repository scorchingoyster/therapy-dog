import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ValueEntry from 'therapy-dog/utils/value-entry';
import Ember from 'ember';

moduleForComponent('block-checkboxes', 'Integration | Component | block checkboxes validation', {
  integration: true
});

let block = Ember.Object.create({
  type: 'checkboxes',
  key: 'colors',
  label: 'Primary Colors',
  options: ['Red', 'Blue', 'Yellow'],
  validations: {
    presence: true
  }
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);

  assert.equal(this.$('h2').text().trim(), 'Primary Colors');
  assert.deepEqual(this.$('label').map((i, e) => $(e).text().trim()).get(), ['Red', 'Blue', 'Yellow']);
  assert.ok(this.$('.block.checkboxes').hasClass('required'));
});

test('it updates the value when checkbox inputs are clicked', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-checkboxes entry=entry}}`);
  
  this.$('input').eq(0).click();
  
  assert.deepEqual(entry.get('value'), ['Red']);
  
  this.$('input').eq(1).click();
  
  assert.deepEqual(entry.get('value'), ['Red', 'Blue']);
  
  this.$('input').eq(0).click();
  
  assert.deepEqual(entry.get('value'), ['Blue']);
});

test('it is invalid if attempted and no checkboxes have been clicked, but becomes valid once a checkbox is clicked', function(assert) {
  let entry = ValueEntry.create({ block, attempted: true });
  this.set('entry', entry);

  this.render(hbs`{{block-checkboxes entry=entry}}`);

  assert.ok(this.$('.block.checkboxes').hasClass('invalid'));
  
  this.$('input').eq(0).click();

  assert.notOk(this.$('.block.checkboxes').hasClass('invalid'));
});
