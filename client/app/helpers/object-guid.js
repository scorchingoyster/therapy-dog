import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
  return Ember.guidFor(params[0]);
});
