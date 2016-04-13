import Ember from 'ember';
/* globals $ */

export default Ember.Controller.extend({
  queryParams: ['path'],
  path: null,
  
  url: Ember.computed('path', function() {
    let path = this.get('path');
    let origin = window.location.protocol + '//' + window.location.host;
    
    if (path) {
      return origin + path;
    } else {
      return origin + ($('base').attr('href') || '');
    }
  })
});
