import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['progress-bar'],
  
  didRender() {
    this._super(...arguments);
    this.$().css('width', (this.get('fraction') * 100) + '%');
  }
});
