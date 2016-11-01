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

/**
 * Returns the form type, which is always the last part of the url, minus any parameters
 * @returns string
 */
export function formType() {
  let urlBase = location.href.split('?')[0].split('/');
  let itemType = urlBase[urlBase.length - 1];

  return itemType.split('-')[0];
}

export default {
  parameterValue: parameterValue,
  formType: formType
};