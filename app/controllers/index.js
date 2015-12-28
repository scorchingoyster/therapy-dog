import Ember from 'ember';
import Arrow from '../utils/arrow';

export default Ember.Controller.extend({
  actions: {
    dump() {
      var dump = [];
      
      var entry = this.get("entry");
      dump.push(JSON.stringify(entry));
      
      var templates = this.get("model").templates;
      
      for (let i = 0; i < templates.length; i++) {
        var result = new Arrow(templates[i].template).render(entry);
        dump.push(result);
      }
      
      this.set("dump", dump);
    }
  }
});
