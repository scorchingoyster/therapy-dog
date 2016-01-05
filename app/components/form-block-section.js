import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['block', 'section'],
  classNameBindings: ['repeat'],
  repeat: Ember.computed.alias('model.repeat'),
  
  init() {
    this._super();
  },
  
  actions: {
    add() {
      var entries = this.get("entry").get(this.get("model.id"));
      
      entries.addObject(Ember.Object.create());
    },

    remove(item) {
      var entries = this.get("entry").get(this.get("model.id"));
      
      entries.removeObject(item);
      
      if (entries.get("length") === 0) {
        entries.addObject(Ember.Object.create());
      }
    }
  }
});
