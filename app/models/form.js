import Ember from 'ember';
import DS from 'ember-data';

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

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  blocks: DS.attr(),
  templates: DS.attr(),
  
  blankEntry: function() {
    return blankEntry(this.get("blocks"));
  }
});
