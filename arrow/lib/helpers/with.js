import Arrow from '../main';
import { isEmpty } from '../utils';

export default function(arrow) {
  arrow.registerHelper('with', Arrow.helper(function([value], hash, body, inverse) {
    if (!isEmpty(value)) {
      return body(value);
    } else {
      return inverse();
    }
  }));
}
