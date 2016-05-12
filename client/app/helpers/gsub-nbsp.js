import Ember from 'ember';

export default Ember.Helper.helper(function([string]) {
  return Ember.String.htmlSafe(Ember.Handlebars.Utils.escapeExpression(string).replace(/ /g, '&nbsp;'));
});
