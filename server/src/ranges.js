const regenerate = require("regenerate");

// Borrowed from the Swift lexer: lib/Parse/Lexer.cpp

// We use the equivalent of clang::isIdentifierHead (without initial dollar signs) and clang::isIdentifierBody, plus the following ranges from "N1518: Recommendations for extended identifier characters for C and C++" http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2010/n3146.html

// Proposed Annex X.1: Ranges of characters allowed
// Proposed Annex X.2: Ranges of characters disallowed initially

// We also add '-' and ':' as a valid identifier character anywhere in an identifier, and '@' as a valid initial character for identifiers.

let extended = regenerate()
.add(0x00A8).add(0x00AA).add(0x00AD).add(0x00AF).addRange(0x00B2, 0x00B5).addRange(0x00B7, 0x00BA).addRange(0x00BC, 0x00BE).addRange(0x00C0, 0x00D6).addRange(0x00D8, 0x00F6).addRange(0x00F8, 0x00FF)
.addRange(0x0100, 0x167F).addRange(0x1681, 0x180D).addRange(0x180F, 0x1FFF)
.addRange(0x200B, 0x200D).addRange(0x202A, 0x202E).addRange(0x203F, 0x2040).add(0x2054).addRange(0x2060, 0x206F)
.addRange(0x2070, 0x218F).addRange(0x2460, 0x24FF).addRange(0x2776, 0x2793).addRange(0x2C00, 0x2DFF).addRange(0x2E80, 0x2FFF)
.addRange(0x3004, 0x3007).addRange(0x3021, 0x302F).addRange(0x3031, 0x303F)
.addRange(0x3040, 0xD7FF)
.addRange(0xF900, 0xFD3D).addRange(0xFD40, 0xFDCF).addRange(0xFDF0, 0xFE44).addRange(0xFE47, 0xFFFD)
.addRange(0x10000, 0x1FFFD).addRange(0x20000, 0x2FFFD).addRange(0x30000, 0x3FFFD).addRange(0x40000, 0x4FFFD).addRange(0x50000, 0x5FFFD).addRange(0x60000, 0x6FFFD).addRange(0x70000, 0x7FFFD).addRange(0x80000, 0x8FFFD).addRange(0x90000, 0x9FFFD).addRange(0xA0000, 0xAFFFD).addRange(0xB0000, 0xBFFFD).addRange(0xC0000, 0xCFFFD).addRange(0xD0000, 0xDFFFD).addRange(0xE0000, 0xEFFFD);

let disallowed = regenerate()
.addRange(0x0300, 0x036F).addRange(0x1DC0, 0x1DFF).addRange(0x20D0, 0x20FF).addRange(0xFE20, 0xFE2F);

let head = regenerate()
.addRange("a", "z").addRange("A", "Z").add("_")
.add("@").add("-").add(":")
.add(extended)
.remove(disallowed);

let tail = regenerate()
.addRange("a", "z").addRange("A", "Z").add("_").addRange("0", "9")
.add("-").add(":")
.add(extended);

console.log(head.toString());
console.log(tail.toString());
