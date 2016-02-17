import Ember from 'ember';

export default Ember.Mixin.create({
  entryEvents: Ember.inject.service(),

  didInsertElement: function() {
    this._super.apply(this, arguments);
    this.get("entryEvents").on("focus", this, "entryDidFocus");
  },

  willDestroyElement: function() {
    this._super.apply(this, arguments);
    this.get("entryEvents").off("focus", this, "entryDidFocus");
  },

  entryDidFocus: function(entry) {
    if (this.get("entry") === entry) {
      this.send("focusEntry");
    }
  }
});
