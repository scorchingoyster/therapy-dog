import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['block', 'file'],
  classNameBindings: ['required'],
  required: Ember.computed.alias('block.required'),
  
  actions: {
    select: function(files) {
      if (files.length > 0) {
        let file = files.item(0);
        this.set("value", Ember.Object.create({ name: file.name, size: file.size, type: file.type, lastModifiedDate: file.lastModifiedDate }));
      } else {
        this.set("value", null);
      }
      
      this.get("onChange")(this.get("value"));
    },

    clear: function() {
      this.set("value", null);
      
      this.get("onChange")(this.get("value"));
    }
  }
});
