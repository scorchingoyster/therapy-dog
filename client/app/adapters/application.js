import DS from "ember-data";
import ENV from 'therapy-dog/config/environment';

export default DS.JSONAPIAdapter.extend({
  namespace: ENV.APP.apiNamespace,
  
  ajaxOptions() {
    let hash = this._super(...arguments);
    let { beforeSend } = hash;
    
    // Spoof the remote_user header if configured. In production, this will be blocked by the web server.
    if (ENV.APP.spoofRemoteUser) {
      hash.beforeSend = (xhr) => {
        xhr.setRequestHeader('remote_user', ENV.APP.spoofRemoteUser);
        if (beforeSend) {
          beforeSend(xhr);
        }
      };
    }
    
    return hash;
  }
});
