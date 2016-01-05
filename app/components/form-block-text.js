import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['block', 'text'],
  classNameBindings: ['required'],
  required: Ember.computed.alias('model.required')
});
