import Ember from 'ember';

export default Ember.Route.extend({
  title: 'Carolina Digital Repository',
  
  actions: {
    error(error) {
      if (error.isAdapterError && error.errors.any(e => e.status === '401')) {
        let location = this.get('router.location');
        let path = location.formatURL(location.getURL());
        this.transitionTo('login', { queryParams: { path: path }});
      }
    }
  }
});
