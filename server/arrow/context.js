function Context(data) {
  if (data) {
    this.frames = [
      Object.keys(data).reduce(function(frame, key) {
        frame[key] = { value: data[key], data: true };
        return frame;
      }, {})
    ];
  } else {
    this.frames = [];
  }
}

Context.prototype.get = function(name) {
  var path = Array.isArray(name) ? name : [name];
  var f, i;
  var value, data;
  
  for (f = this.frames.length - 1; f >= 0; f--) {
    if (path[0] in this.frames[f]) {
      value = this.frames[f][path[0]];
    } else {
      continue;
    }
    
    if (value.data) {
      data = value.value;
      
      for (i = 1; i < path.length; i++) {
        if (path[i] in data) {
          data = data[path[i]];
        } else {
          data = undefined;
          break;
        }
      }
      
      return { value: data, data: true };
    } else {
      return value;
    }
  }
  
  return { value: undefined, data: false };
};

Context.prototype.concat = function(values) {
  var context = new Context();
  context.frames = this.frames.concat(values);
  return context;
};

module.exports = Context;
