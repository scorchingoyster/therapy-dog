import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    updateValue(id, value) {
      this.get('value').set(id, value);
    },
    
    reset() {
      this.set('value', Ember.Object.create());
    },
    
    dump() {
      console.log(JSON.stringify(this.get('value')));
    }
  }
});
