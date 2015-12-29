import Ember from 'ember';

export default Ember.Component.extend({
  file: function() {
    return this.get("entry").get(this.get("model.id"));
  }.property(),

  actions: {
    select: function(files) {
      // FIXME: find a better way to observe changes on a dynamic key of item, or a better approach for dealing with file references.
      this.propertyWillChange("file");
      
      if (files.length > 0) {
        let file = files.item(0);
        this.get("entry").set(this.get("model.id"), Ember.Object.create({ name: file.name, size: file.size, type: file.type, lastModifiedDate: file.lastModifiedDate }));
      } else {
        this.get("entry").set(this.get("model.id"), undefined);
      }
      
      this.propertyDidChange("file");
    },

    clear: function() {
      this.propertyWillChange("file");
      
      this.get("entry").set(this.get("model.id"), undefined);
      
      this.propertyDidChange("file");
    }
  }
});
