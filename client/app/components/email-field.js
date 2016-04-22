import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  type: 'email',
  attributeBindings: ['checked', 'type', 'value'],

  checked: Ember.computed('value', 'groupValue', function() {
    return this.get('groupValue').contains(this.get('value'));
  })
});