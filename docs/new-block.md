# How to add a new block type

For example, a "map" block.

## Server

### Add a block checker

server/lib/models/form/block-checkers.js

    exports.map = checker.shape({
      key: checker.string(),
      label: checker.optional(checker.string()),
      // ...
    });
    
    // ...
    
    exports.block = checker.recordTypes({
      // ...
      map: checker.lookup(exports, 'map')
    });

### Add an input checker

server/lib/models/form/block-input-checkers.js

### Add a deserializer

server/lib/models/form/block-deserializers.js

### Add a summarizer

server/lib/models/form/block-summarizers.js

### Add a resource attributes function

server/lib/models/form/block-resource-attributes.js

## Client

### Add integration tests

client/tests/integration/components/block-map-test.js

### Add a component

client/app/pods/block-map/component.js
client/app/pods/block-map/template.hbs

### Add validation if necessary

client/app/utils/value-entry.js

### Add styles

client/app/styles

## Documentation

### Update types documentation

docs/types.md
