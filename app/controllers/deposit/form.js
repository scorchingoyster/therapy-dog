import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    updateValue(id, value) {
      this.get('model').set(id, value);
    },
    
    reset() {
      this.set('model', Ember.Object.create());
    },
    
    dump() {
      console.log(JSON.stringify(this.get('model')));
    }
  }
});
