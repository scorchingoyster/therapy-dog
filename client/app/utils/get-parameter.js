export function _parameters() {
  let parameters = location.search;
  return parameters.split('&');
}

export function parameterValue(regex) {
  let parameters = _parameters();
  let re = new RegExp(regex);
  let value = undefined;

  for (let i=0; i<parameters.length; i++) {
    if (re.test(parameters[i])) {
      value = parameters[i].split('=')[1];
      break;
    }
  }

  return value;
}

export default {
  parameterValue: parameterValue
}