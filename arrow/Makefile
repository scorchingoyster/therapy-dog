.PHONY: all

all: lib/parser.js

lib/parser.js: src/parser.pegjs
	node_modules/.bin/pegjs src/parser.pegjs lib/parser.js
