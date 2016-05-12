import Ember from 'ember';

export default Ember.Route.extend({
  deposit: Ember.inject.service(),
  
  renderTemplate: function(controller, model) {
    if (model.get('authorized')) {
      this.render('deposit/form', { model });
    } else {
      this.render('deposit/login');
    }
  },
  
  actions: {
    deposit() {
      let deposit = this.modelFor('deposit');
      let promise = this.get('deposit').submit(deposit);
      
      this.render('deposit/loading');
      
      promise
      .then((result) => {
        deposit.set('result', result);
        this.render('deposit/result', { model: deposit });
      });
    }
  }
});
