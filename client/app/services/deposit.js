import Ember from 'ember';
import ENV from 'therapy-dog/config/environment';
import ObjectEntry from 'therapy-dog/utils/object-entry';
/* globals $ */

function deserializeChildren(value) {
  if (Ember.isArray(value)) {
    return value.map(function(block) {
      let object = Ember.Object.create(block);
      if (block.children) {
        object.set('children', deserializeChildren(block.children));
      }
      return object;
    });
  }
}

export default Ember.Service.extend({
  get(formId) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let headers = {};
      if (ENV.APP.spoofRemoteUser) {
        headers['remote_user'] = ENV.APP.spoofRemoteUser;
      }
      
      $.ajax('/' + ENV.APP.apiNamespace + '/forms/' + formId, {
        method: 'GET',
        headers
      })
      .done(function(response) {
        let form = Ember.Object.create({
          id: response.data.id,
          title: response.data.attributes.title,
          description: response.data.attributes.description,
          children: deserializeChildren(response.data.attributes.children)
        });
        
        let deposit = Ember.Object.create({
          authorized: response.meta.authorized,
          mail: response.meta.mail,
          form: form,
          entry: ObjectEntry.create({ block: form })
        });
        
        if (ENV.APP.spoofMail) {
          deposit.set('mail', ENV.APP.spoofMail);
        }
        
        resolve(deposit);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        reject(errorThrown);
      });
    });
  },
  
  submit(deposit) {
    let payload = {
      form: deposit.get('form.id'),
      values: deposit.get('entry').flatten()
    };
  
    return new Ember.RSVP.Promise(function(resolve) {
      let headers = {};
      if (ENV.APP.spoofRemoteUser) {
        headers['remote_user'] = ENV.APP.spoofRemoteUser;
      }
    
      $.ajax('/' + ENV.APP.apiNamespace + '/deposits', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers
      })
      .done(function(data) {
        resolve(data);
      })
      .fail(function() {
        resolve({ status: 'ERROR' });
      });
    });
  }
});
