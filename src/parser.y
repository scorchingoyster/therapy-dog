%start root

%ebnf

%%

root
  : program EOF { return $1; }
  ;

program
  : expressions { $$ = { type: "program", body: $1 }; }
  | { $$ = { type: "program", body: [] }; }
  ;

expressions
  : expression NEWLINE expressions { $3.unshift($1); $$ = $3; }
  | expression { $$ = [$1]; }
  ;

expression
  : literal
  | path
  | call
  | arrow
  ;

literal
  : BOOLEAN { $$ = { type: "boolean", value: $1 === "true" }; }
  | STRING { $$ = { type: "string", value: $1 }; }
  | NUMBER { $$ = { type: "number", value: Number($1) }; }
  ;

path
  : NAME PATH_SEP path { $3.parts.unshift($1); $$ = $3; }
  | NAME PATH_SEP NAME { $$ = { type: "path", parts: [$1, $3] }; }
  ;

call
  : NAME params hash block inverse { $$ = { type: "call", name: $1, params: $2, hash: $3, locals: $4 ? $4.locals : [], body: $4 ? $4.program : null, inverse: $5 }; }
  ;

inverse
  : ELSE OPEN_BLOCK program CLOSE_BLOCK { $$ = $3; }
  | ELSE NAME params hash locals OPEN_BLOCK program CLOSE_BLOCK inverse { $$ = { type: "call", name: $2, params: $3, hash: $4, locals: $5, body: $7, inverse: $9 }; }
  | { $$ = null; }
  ;

params
  : param params { $2.unshift($1); $$ = $2; }
  | { $$ = []; }
  ;

hash
  : pairs { $$ = { type: "hash", pairs: $1 }; }
  ;

pairs
  : pair pairs { $2.unshift($1); $$ = $2; }
  | { $$ = []; }
  ;

pair
  : KEY EQUALS param { $$ = { type: "pair", key: $1, value: $3 }; }
  ;

block
  : locals OPEN_BLOCK program CLOSE_BLOCK { $$ = { locals: $1, program: $3 }; }
  | { $$ = null; }
  ;

locals
  : OPEN_LOCALS local_names CLOSE_LOCALS { $$ = $2; }
  | { $$ = []; }
  ;

local_names
  : NAME local_names { $2.unshift($1); $$ = $2; }
  | NAME { $$ = [$1]; }
  ;

arrow
  : param ARROW sexprs { $$ = { type: "arrow", source: $1, target: $3 }; }
  | param ARROW NAME params hash { $$ = { type: "arrow", source: $1, target: [{ type: "call", name: $3, params: $4, hash: $5, locals: [], body: null, inverse: null }] }; }
  ;

param
  : NAME { $$ = { type: "call", name: $1, params: [], hash: { type: "hash", pairs: [] }, locals: [], body: null, inverse: null }; }
  | literal
  | sexpr
  | path
  ;

sexprs
  : sexpr sexprs { $2.unshift($1); $$ = $2; }
  | { $$ = []; }
  ;

sexpr
  : OPEN_SEXPR expression CLOSE_SEXPR { $$ = $2; }
  ;
