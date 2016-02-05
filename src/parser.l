%{

function strip(start, end) {
  return yytext = yytext.substr(start, yyleng - end);
}

%}

ID_HEAD [@-Z_a-z\xA8\xAA\xAD\xAF\xB2-\xB5\xB7-\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF\u1E00-\u1FFF\u200B-\u200D\u202A-\u202E\u203F\u2040\u2054\u2060-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793\u2C00-\u2DFF\u2E80-\u2FFF\u3004-\u3007\u3021-\u302F\u3031-\uD7FF\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44\uFE47-\uFFFD]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB40-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]
ID_BODY [0-9A-Z_a-z\xA8\xAA\xAD\xAF\xB2-\xB5\xB7-\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u167F\u1681-\u180D\u180F-\u1FFF\u200B-\u200D\u202A-\u202E\u203F\u2040\u2054\u2060-\u218F\u2460-\u24FF\u2776-\u2793\u2C00-\u2DFF\u2E80-\u2FFF\u3004-\u3007\u3021-\u302F\u3031-\uD7FF\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE44\uFE47-\uFFFD]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB40-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]
ID {ID_HEAD}{ID_BODY}*

%%

"("                         { return 'OPEN_SEXPR'; }
")"                         { return 'CLOSE_SEXPR'; }
\n*"{"\n*                   { return 'OPEN_BLOCK'; }
\n*"}"\n*                   { return 'CLOSE_BLOCK'; }
"as"\s+"|"                  { return 'OPEN_LOCALS'; }
"|"                         { return 'CLOSE_LOCALS'; }
[\n;]+                      { return 'NEWLINE'; }
[ \t]+                      { }
"="                         { return 'EQUALS'; }
"->"                        { return 'ARROW'; }
"."                         { return 'PATH_SEP'; }
"else"                      { return 'ELSE'; }
"true"                      { return 'BOOLEAN'; }
"false"                     { return 'BOOLEAN'; }
{ID}/(?:\s*'=')             { return 'KEY'; }
{ID}                        { return 'NAME'; }
'"'("\\"["]|[^"])*'"'       { yytext = strip(1, 2).replace(/\\"/g, '"'); return 'STRING'; }
"'"("\\"[']|[^'])*"'"       { yytext = strip(1, 2).replace(/\\'/g, "'"); return 'STRING'; }
\-?[0-9]+(?:\.[0-9]+)?      { return 'NUMBER'; }

<<EOF>>                     { return 'EOF'; }

%%
