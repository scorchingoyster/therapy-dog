function buildProgram(body) {
  return {
    type: "program",
    body: body || []
  };
}

function buildString(value) {
  return {
    type: "string",
    value: value
  };
}

function buildBoolean(value) {
  return {
    type: "boolean",
    value: value
  };
}

function buildNumber(value) {
  return {
    type: "number",
    value: value
  };
}

function buildHash(pairs) {
  return {
    type: "hash",
    pairs: pairs || []
  };
}

function buildPair(key, value) {
  return {
    type: "pair",
    key: key,
    value: value
  };
}

function buildCall(name, params, hash, locals, body, inverse) {
  return {
    type: "call",
    name: name,
    params: params || [],
    hash: hash || buildHash(),
    locals: locals || [],
    body: body || null,
    inverse: inverse || null
  };
}

function buildPath(parts) {
  return {
    type: "path",
    parts: parts || []
  };
}

function buildArrow(source, target) {
  return {
    type: "arrow",
    source: source,
    target: target || []
  };
}

function buildPartial(name, context) {
  return {
    type: "partial",
    name: name,
    context: context || buildHash()
  };
}

export default {
  program: buildProgram,
  string: buildString,
  boolean: buildBoolean,
  number: buildNumber,
  hash: buildHash,
  pair: buildPair,
  call: buildCall,
  path: buildPath,
  arrow: buildArrow,
  partial: buildPartial
};
