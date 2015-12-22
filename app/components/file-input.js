import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  attributeBindings: ['type', 'multiple'],
  type: 'file',
  multiple: false,
  
  change() {
    this.sendAction('select', this.element.files);
  }
});