import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    error(error) {
      if (error.isAdapterError && error.errors.any(e => e.status === '401')) {
        this.transitionTo('login', { queryParams: { returnPath: this.get('router.url') }});
      }
    }
  }
});
