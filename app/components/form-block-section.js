import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super();
    
    this.set("entries", [Ember.Object.create()]);
  },
  
  actions: {
    add() {
      this.get("entries").addObject(Ember.Object.create());
    },

    remove(item) {
      this.get("entries").removeObject(item);
      
      if (this.get("entries.length") == 0) {
        this.get("entries").addObject(Ember.Object.create());
      }
    }
  }
});
