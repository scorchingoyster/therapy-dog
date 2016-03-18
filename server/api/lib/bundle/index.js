import Arrow from 'arrow';
import { Item, File, Link, Metadata, Bundle } from './model';

export default {
  item: Arrow.helper(function(params, hash, body) {
    return new Item(body(), hash);
  }),

  file: Arrow.helper(function(params, hash, body) {
    return new File(body(), hash);
  }),

  link: Arrow.helper(function(params, hash, body) {
    return new Link(hash);
  }),

  metadata: Arrow.helper(function(params, hash, body) {
    return new Metadata(body(), hash);
  }),
  
  document: Arrow.helper(function(params, hash, body) {
    return new Bundle(body());
  })
};
