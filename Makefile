lib/arrow/parser.js: src/parser.y src/parser.l
	cd lib/arrow && jison ../../src/parser.y ../../src/parser.l --output-file=parser.js --parser-type=lr
