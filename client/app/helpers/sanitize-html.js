import Ember from 'ember';
/* globals DOMPurify */

export default Ember.Helper.helper(function(params) {
  return Ember.String.htmlSafe(DOMPurify.sanitize(params[0]));
});
