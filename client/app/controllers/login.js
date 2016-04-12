import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['returnPath'],
  returnPath: null,
  
  returnURL: Ember.computed('returnPath', function() {
    let returnPath = this.get('returnPath');
    let origin = window.location.protocol + "//" + window.location.host;
    
    if (returnPath) {
      return origin + returnPath;
    } else {
      return origin;
    }
  })
});
