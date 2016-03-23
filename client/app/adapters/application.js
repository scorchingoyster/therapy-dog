import DS from "ember-data";
import ENV from 'therapy-dog/config/environment';

export default DS.JSONAPIAdapter.extend({
  namespace: ENV.APP.apiNamespace
});
