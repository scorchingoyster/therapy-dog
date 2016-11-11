export function parameterValue(regex) {
  let parameters = location.search.split('&');
  let re = new RegExp(regex);
  let value;

  for (let i=0; i<parameters.length; i++) {
    if (re.test(parameters[i])) {
      value = parameters[i].split('=')[1];
      break;
    }
  }

  return value;
}

export default {
  parameterValue: parameterValue,
};