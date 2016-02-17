import Ember from 'ember';
import DS from 'ember-data';

function deserialize(value) {
  return value.map(function(block) {
    let object = Ember.Object.create(block);
    if (block.children) {
      object.set('children', deserialize(block.children));
    }
    return object;
  });
}

export default DS.Transform.extend({
  serialize: function(value) {
    return value;
  },
  
  deserialize: function(value) {
    return deserialize(value);
  }
});
