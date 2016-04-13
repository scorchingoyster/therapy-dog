import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  type: 'radio',
  attributeBindings: ['checked', 'type', 'value', 'name'],

  checked: Ember.computed('value', 'groupValue', function() {
    return this.get('groupValue') === this.get('value');
  }),

  change: function () {
    this.set('groupValue', this.get('value'));
  }
});
