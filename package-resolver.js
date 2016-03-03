import path from 'path';
import fs from 'fs';

class PackageResolver {
  constructor(names) {
    this.names = names;
  }
  
  resolveId(file, origin) {
    for (let i = 0; i < this.names.length; i++) {
      let name = this.names[i];
      
      if (file === name) {
        return path.join(name, 'lib', 'main.js');
      } else if (file.startsWith(name + '/')) {
        return path.join(name, 'lib', file.slice((name + '/').length) + '.js');
      }
    }
  }
}

export default function plugin(names) {
  let resolver = new PackageResolver(names);
  
  return {
    resolveId: function(file, origin) {
      return resolver.resolveId(file, origin);
    }
  }
}
