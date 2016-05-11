import Ember from 'ember';

export default Ember.Controller.extend({
  url: Ember.computed(function() {
    return window.location.href;
  })
});
