{
  var b = require('./builders');
}

Program
  = __ body:(stmt:Statement __ { return stmt; } / ";" __ { return undefined; })* {
      return b.program(body.filter(function(s) { return typeof s !== 'undefined' }));
  }

Statement
  = CallWithBlock
  / expr:(CallWithoutBlock / Arrow / Path / Partial / Literal / Subexpression) EOS { return expr; }

Expression
  = CallWithBlock
  / CallWithoutBlock
  / Arrow
  / Path
  / Partial
  / Literal
  / Subexpression

Subexpression
  = "(" _ expr:Expression _ ")" { return expr; }

Arrow
  = source:ArrowSource _ ArrowToken _ target:ArrowTarget {
      return b.arrow(source, target);
    }

ArrowSource
  = CallHead
  / Path
  / Partial
  / Literal
  / Subexpression

ArrowTarget
  = target:CallHead { return [target]; }
  / (_ "(" _ target:CallHead _ ")" { return target; })*

CallWithoutBlock
  = head:CallHead _ !ArrowToken {
      return head;
    }

CallWithBlock
  = head:CallHead _ !ArrowToken body:CallBody {
      return b.call(head.name, head.params, head.hash, body.locals, body.body, body.inverse);
    }

CallHead
  = name:Identifier !(PathSeparator) params:(_ param:Param { return param; })* pairs:(_ pair:Pair { return pair; })* {
      return b.call(name, params, b.hash(pairs));
    }

CallBody
  = locals:CallLocals? body:(__ block:Block { return block; }) inverse:(__ inverse:CallInverse { return inverse; })? {
      return { locals: locals, body: body, inverse: inverse };
    }

CallLocals
  = LocalsBegin _ locals:(name:Identifier _ { return name; })+ LocalsEnd {
      return locals;
    }

CallInverse
  = ElseToken __ head:CallHead _ body:CallBody {
      return b.call(head.name, head.params, head.hash, body.locals, body.body, body.inverse);
    }
  / 
  ElseToken __ block:Block { return block; }

Param
  = name:Identifier !(_ "=" / _ PathSeparator) { return b.call(name); }
  / Literal
  / Subexpression

Pair
  = key:Key _ "=" _ value:Param { return b.pair(key, value); }

Key
  = name:Identifier &(_ "=") { return name; }

Block
  = "{" program:Program "}" { return program; }

Path
  = head:PathPart tail:(PathSeparator part:PathPart { return part; })* {
      return b.path([head].concat(tail));
    }

PathPart
  = "`" chars:PathPartCharacter+ "`" { return chars.join(""); }
  / Identifier

PathPartCharacter
  = !("`" / "\\" / LineTerminator) . { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }

Partial
  = PartialToken _ name:Param pairs:(_ pair:Pair { return pair; })* {
      return b.partial(name, b.hash(pairs));
  }

Literal
  = value:Number { return b.number(value); }
  / value:Boolean { return b.boolean(value); }
  / value:String { return b.string(value); }

Number
  = "-"? [0-9]+ ("." [0-9]+)? { return Number(text()); }

Boolean
  = "true" { return true; }
  / "false" { return false; }

String
  = '"' chars:DoubleStringCharacter* '"' { return chars.join(""); }
  / "'" chars:SingleStringCharacter* "'" { return chars.join(""); }

DoubleStringCharacter
  = !('"' / "\\" / LineTerminator) . { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }

SingleStringCharacter
  = !("'" / "\\" / LineTerminator) . { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
  = CharacterEscapeSequence

CharacterEscapeSequence
  = SingleEscapeCharacter
  / NonEscapeCharacter

SingleEscapeCharacter
  = "'"
  / '"'
  / "`"
  / "\\"
  / "n"  { return "\n"; }
  / "r"  { return "\r"; }

NonEscapeCharacter
  = !(SingleEscapeCharacter / LineTerminator) . { return text(); }

LocalsBegin
  = "as" _ "|"

LocalsEnd
  = "|"

ElseToken
  = "else"

PartialToken
  = "partial"

ArrowToken
  = "->"

PathSeparator
  = "."

ReservedWord
  = Boolean
  / ElseToken
  / PartialToken
  / ArrowToken
  / LocalsBegin

Identifier "identifier"
  = !ReservedWord IdentifierHead IdentifierTail* { return text(); }

IdentifierHead
  = [\-:@-Z_a-z\xA8\xAA\xAD\xAF\xB2-\xB5\xB7-\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF\u1E00-\u1FFF\u200B-\u200D\u202A-\u202E\u203F\u2040\u2054\u2060-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793\u2C00-\u2DFF\u2E80-\u2FFF\u3004-\u3007\u3021-\u302F\u3031-\uD7FF\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44\uFE47-\uFFFD]
  / [\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB40-\uDB7E][\uDC00-\uDFFF]
  / [\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]

IdentifierTail
  = [\-0-:A-Z_a-z\xA8\xAA\xAD\xAF\xB2-\xB5\xB7-\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u167F\u1681-\u180D\u180F-\u1FFF\u200B-\u200D\u202A-\u202E\u203F\u2040\u2054\u2060-\u218F\u2460-\u24FF\u2776-\u2793\u2C00-\u2DFF\u2E80-\u2FFF\u3004-\u3007\u3021-\u302F\u3031-\uD7FF\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE44\uFE47-\uFFFD]
  / [\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB40-\uDB7E][\uDC00-\uDFFF]
  / [\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]

Comment
  = "#" (!LineTerminator .)*

WhiteSpace
  = " "

LineTerminator
  = "\n"

__
  = (WhiteSpace / LineTerminator / Comment)*

_
  = WhiteSpace*

EOS
  = __ ";"
  / _ Comment? LineTerminator
  / _ &"}"
  / __ EOF

EOF
  = !.
