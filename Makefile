.PHONY: build

build:
	rollup -c rollup.config.js

arrow/lib/parser.js: arrow/src/parser.pegjs
	node_modules/.bin/pegjs arrow/src/parser.pegjs arrow/lib/parser.js
