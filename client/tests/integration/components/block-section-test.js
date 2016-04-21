import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ArrayEntry from 'therapy-dog/utils/array-entry';
import Ember from 'ember';

moduleForComponent('block-section', 'Integration | Component | Section block', {
  integration: true
});

let authorsSectionBlock = Ember.Object.create({
  type: 'section',
  key: 'authors',
  label: 'Authors',
  repeat: true,
  children: [
    Ember.Object.create({ type: 'text', key: 'first', label: 'First Name' }),
    Ember.Object.create({ type: 'text', key: 'last', label: 'Last Name' })
  ]
});

test('it renders', function(assert) {
  let entry = ArrayEntry.create({ block: authorsSectionBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-section entry=entry}}`);

  assert.equal(this.$('h2').text().trim(), 'Authors');
  assert.equal(this.$('label').eq(0).text().trim(), 'First Name');
  assert.equal(this.$('label').eq(1).text().trim(), 'Last Name');
});

test('it updates the entry value when text is entered', function(assert) {
  let entry = ArrayEntry.create({ block: authorsSectionBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-section entry=entry}}`);
  
  this.$('input').eq(0).val('Someone');
  this.$('input').change();
  
  this.$('input').eq(1).val('Author');
  this.$('input').change();
  
  assert.deepEqual(entry.flatten(), [{ first: 'Someone', last: 'Author' }]);
});

test('it adds an object to the entry when the "Add" button is clicked', function(assert) {
  let entry = ArrayEntry.create({ block: authorsSectionBlock });
  this.set('entry', entry);
  
  this.render(hbs`{{block-section entry=entry}}`);
  
  assert.equal(entry.get('value.length'), 1);
  
  this.$('.add button').click();
  
  assert.equal(entry.get('value.length'), 2);
});
