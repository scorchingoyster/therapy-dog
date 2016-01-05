import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['block', 'select'],
  classNameBindings: ['required'],
  required: Ember.computed.alias('model.required'),
  
  change(event) {
    this.get("entry").set(this.get("model.id"), event.target.value);
  }
});
