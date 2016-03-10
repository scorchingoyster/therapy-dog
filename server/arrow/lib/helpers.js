import registerEach from './helpers/each';
import registerIf from './helpers/if';
import registerWith from './helpers/with';

export function registerDefaultHelpers(arrow) {
  registerEach(arrow);
  registerIf(arrow);
  registerWith(arrow);
}
