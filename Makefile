.PHONY: build

build:
	node_modules/.bin/rollup -c rollup.config.js

run:
	node_modules/.bin/nodemon --watch arrow/lib --watch api/lib --watch server.js --exec "make build && node build/server-bundle"

arrow/lib/parser.js: arrow/src/parser.pegjs
	node_modules/.bin/pegjs arrow/src/parser.pegjs arrow/lib/parser.js
