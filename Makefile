.PHONY: all test

all: lib/arrow/parser.js

test:
	mocha "tests/**/*-test.js"

lib/arrow/parser.js: src/parser.y src/parser.l
	cd lib/arrow && jison ../../src/parser.y ../../src/parser.l --output-file=parser.js --parser-type=lr
