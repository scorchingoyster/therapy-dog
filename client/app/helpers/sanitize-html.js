import Ember from 'ember';
/* globals DOMPurify */

// Add target="_blank" to links.
DOMPurify.addHook('afterSanitizeAttributes', function(node) {
  if ('target' in node) {
    node.setAttribute('target', '_blank');
  }
});

export default Ember.Helper.helper(function(params) {
  return Ember.String.htmlSafe(DOMPurify.sanitize(params[0]));
});
