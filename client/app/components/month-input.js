import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['month-input'],
  
  value: Ember.computed('year', 'month', {
    get() {
      let { year, month } = this.getProperties('year', 'month');
      
      if (Ember.isEmpty(year) && Ember.isEmpty(month)) {
        return '';
      } else {
        return (year || '') + '-' + (month || '');
      }
    },
    
    set(key, value) {
      if (Ember.typeOf(value) === 'string') {
        let [year, month] = value.split('-');
        this.set('year', year || '');
        this.set('month', month || '');
      } else {
        this.set('year', '');
        this.set('month', '');
      }
    }
  }),
  
  actions: {
    setMonth: function(month) {
      this.set('month', month);
    }
  }
});
