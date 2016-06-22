# How to add a new block type

For example, a "map" block.

## Server

### Add a type alias for the form block

### Handle the block type in Form#transformValues

### Handle the block type in Form#summarizeInput

server/lib/models/form.js

### Handle the block type in flattenSummary

server/lib/mailer.js

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
