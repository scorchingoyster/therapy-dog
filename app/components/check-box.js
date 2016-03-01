import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  type: 'checkbox',
  attributeBindings: ['checked', 'type', 'value'],

  checked: Ember.computed('value', 'groupValue', function() {
    return this.get('groupValue').contains(this.get('value'));
  }),

  change: function () {
    if (this.element.checked) {
      this.get('groupValue').addObject(this.get('value'));
    } else {
      this.get('groupValue').removeObject(this.get('value'));
    }
  }
});
