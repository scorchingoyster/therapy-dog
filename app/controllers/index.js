import Ember from 'ember';
import Arrow from '../utils/arrow';

function getContexts(context, id) {
  if (id in context) {
    var c = context[id];
    
    if (Array.isArray(c)) {
      return c;
    } else {
      return [c];
    }
  } else {
    for (id in context) {
      if (context.hasOwnProperty(id)) {
        var result = getContexts(context[id]);
        if (Array.isArray(result)) {
          return result;
        }
      }
    }
  }
}

export default Ember.Controller.extend({
  actions: {
    dump() {
      var dump = [];
      
      var entry = this.get("entry");
      dump.push(JSON.stringify(entry));
      
      var templates = this.get("model").templates;
      
      templates.forEach(template => {
        if (template.section) {
          let contexts = getContexts(entry, template.section);
          
          if (Array.isArray(contexts)) {
            contexts.forEach(context => {
              dump.push(new Arrow(template.block).render(context));
            });
          }
        } else {
          dump.push(new Arrow(template.block).render(entry));
        }
      });
      
      this.set("dump", dump);
    }
  }
});
