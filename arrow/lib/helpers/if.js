import Arrow from '../main';
import { isEmpty } from '../utils';

export default function(arrow) {
  arrow.registerHelper('if', Arrow.helper(function([conditional], hash, body, inverse) {
    if (!isEmpty(conditional)) {
      return body();
    } else {
      return inverse();
    }
  }));
}
