import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['block', 'section'],
  classNameBindings: ['repeat'],
  repeat: Ember.computed.alias('block.repeat'),
  
  normalizeValue() {
    if (this.get("value") == null) {
      if (this.get("block.repeat")) {
        this.set("value", [Ember.Object.create()]);
      } else {
        this.set("value", Ember.Object.create());
      }
      
      this.get("onChange")(this.get("value"));
    }
  },
  
  init() {
    this._super(...arguments);
    
    this.normalizeValue();
  },
  
  valueChanged: Ember.observer('value', function() {
    this.normalizeValue();
  }),
  
  actions: {
    updateValue(key, value) {
      this.get("value").set(key, value);
      
      this.get("onChange")(this.get("value"));
    },
    
    updateItem(index, key, value) {
      this.get("value").objectAt(index).set(key, value);
      
      this.get("onChange")(this.get("value"));
    },
    
    addItem() {
      this.get("value").pushObject(Ember.Object.create());
      
      this.get("onChange")(this.get("value"));
    },
    
    removeItem(index) {
      this.get("value").removeAt(index);
      
      if (this.get("value").length === 0) {
        this.get("value").pushObject(Ember.Object.create());
      }
      
      this.get("onChange")(this.get("value"));
    }
  }
});
