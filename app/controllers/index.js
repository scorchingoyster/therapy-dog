import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    dump() {
      this.set("dump", JSON.stringify(this.get("entry")));
    }
  }
});
