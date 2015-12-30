import Ember from 'ember';

function blankEntry(blocks) {
  var entry = Ember.Object.create();
  
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    
    if (block.type === "section") {
      if (block.repeat) {
        entry.set(block.id, [blankEntry(block.children)]);
      } else {
        entry.set(block.id, blankEntry(block.children));
      }
    }
  }
  
  return entry;
}

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('form', params.form_id);
  },
  
  setupController(controller, model) {
    this._super(controller, model);
    
    controller.set("entry", blankEntry(model.get("blocks")));
  }
});
