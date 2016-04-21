import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ValueEntry from 'therapy-dog/utils/value-entry';
import Ember from 'ember';

moduleForComponent('block-text', 'Integration | Component | Text block', {
  integration: true
});

let block = Ember.Object.create({
  type: 'text',
  key: 'first-name',
  label: 'First Name',
  required: true
});

test('it renders', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-text entry=entry}}`);

  assert.equal(this.$('label').text().trim(), 'First Name');
  assert.ok(this.$('.block').hasClass('required'));
});

test('it updates the entry value when text is entered', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);
  
  this.render(hbs`{{block-text entry=entry}}`);
  
  this.$('input').val('Someone');
  this.$('input').change();
  
  assert.deepEqual(entry.get('value'), 'Someone');
});

test('it is invalid with no text entered if required', function(assert) {
  let entry = ValueEntry.create({ block });
  this.set('entry', entry);

  this.render(hbs`{{block-text entry=entry}}`);
  
  assert.ok(this.$('.block').hasClass('invalid'));
  
  this.$('input').val('Someone');
  this.$('input').change();

  assert.notOk(this.$('.block').hasClass('invalid'));
});
