import Arrow from '../main';
import { isEmpty } from '../utils';

export default function(arrow) {
  arrow.registerHelper('each', Arrow.helper(function([items], hash, body, inverse) {
    if (!isEmpty(items)) {
      if (Array.isArray(items)) {
        return items.reduce(function(result, item, index) {
          return result.concat(body(item, index));
        }, []);
      } else {
        return body(items, 0);
      }
    } else {
      return inverse();
    }
  }));
}
