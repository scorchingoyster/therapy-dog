'use strict';

class Context {
  constructor(data) {
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

  get(name) {
    let path = Array.isArray(name) ? name : [name];
    let value;

    for (let f = this.frames.length - 1; f >= 0; f--) {
      if (path[0] in this.frames[f]) {
        value = this.frames[f][path[0]];
      } else {
        continue;
      }

      if (value.data) {
        let data = value.value;

        for (let i = 1; i < path.length; i++) {
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
  }

  concat(values) {
    let context = new Context();
    context.frames = this.frames.concat(values);
    return context;
  }
}

module.exports = Context;
