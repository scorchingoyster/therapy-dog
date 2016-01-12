import Ember from 'ember';
import Arrow from '../utils/arrow';

// Return all values for the id and their surrounding context.
function getValueContextPairs(context, id) {
  if (context[id]) {
    return [{ value: context[id], context: context }];
  } else {
    let result = [];
    
    for (let key in context) {
      if (context.hasOwnProperty(key)) {
        let value = context[key];
        let type = Ember.typeOf(value);
        
        if ("object" === type) {
          result = result.concat(getValueContextPairs(value, id));
        } else if ("array" === type) {
          value.forEach(v => {
            result = result.concat(getValueContextPairs(v, id));
          });
        }
      }
    }
    
    return result;
  }
}

// Return all values for the id
function getValues(context, id) {
  if (context[id]) {
    return [context[id]];
  } else {
    let result = [];
    
    for (let key in context) {
      if (context.hasOwnProperty(key)) {
        let value = context[key];
        let type = Ember.typeOf(value);
        
        if ("object" === type || "instance" === type) {
          result = result.concat(getValues(value, id));
        } else if ("array" === type) {
          value.forEach(v => {
            result = result.concat(getValues(v, id));
          });
        }
      }
    }
    
    return result;
  }
}

function getFileBlocks(block) {
  let result = [];
  
  block.forEach(b => {
    if (b.type === "file") {
      result.push(b);
    } else if (b.children) {
      result = result.concat(getFileBlocks(b.children));
    }
  });
  
  return result;
}

export default Ember.Controller.extend({
  viewName: "form",
  
  actions: {
    showForm() {
      this.set("viewName", "form");
    },
    
    showTemplates() {
      this.set("viewName", "templates");
    },
    
    showOutput() {
      this.set("viewName", "output");
      
      let entry = this.get("entry");
      
      // Form data
      this.set("json", JSON.stringify(entry));
      
      // Files
      let form = this.get("model");
      let blocks = getFileBlocks(form.get("blocks"));
      
      let files = [];
      blocks.forEach(b => {
        files = files.concat(getValues(entry, b.id));
      });
      this.set("files", files);
      
      // Metadata
      let dump = [];
      let templates = form.get("templates");
      
      templates.forEach(template => {
        if (template.file) {
          let pairs = getValueContextPairs(entry, template.file);
          
          pairs.forEach(({ value, context }) => {
            dump.push({ file: value, metadata: new Arrow(template.block).render(context) });
          });
        } else {
          dump.push({ metadata: new Arrow(template.block).render(entry) });
        }
      });
      
      this.set("dump", dump);
    }
  }
});
