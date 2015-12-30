import Ember from 'ember';

export default Ember.Component.extend({
  change(event) {
    this.get("entry").set(this.get("model.id"), event.target.checked);
  }
});
