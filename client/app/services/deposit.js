import Ember from 'ember';
import ENV from 'therapy-dog/config/environment';
import ObjectEntry from 'therapy-dog/utils/object-entry';
import { parameterValue } from 'therapy-dog/utils/get-parameter';
/* globals $ */

const DEPOSITOR_EMAIL_KEY = 'virtual:depositor-email';

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

function buildPayload(deposit) {
  let values = deposit.get('entry').flatten();
  
  let depositorEmail = values[DEPOSITOR_EMAIL_KEY];
  delete values[DEPOSITOR_EMAIL_KEY];

  return {
    form: deposit.get('form.id'),
    destination: deposit.get('form.destination'),
    values,
    depositorEmail
  };
}

export default Ember.Service.extend({
  get(params) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let headers = {};

      if (ENV.APP.spoofRemoteUser) {
        headers['remote_user'] = ENV.APP.spoofRemoteUser;
      }

      let collection = parameterValue('collection');
      let adminOnly = parameterValue('adminOnly');
      let additionalParams = '';

      if (adminOnly !== undefined && adminOnly) {
        additionalParams += '/adminOnly';
      }

      $.ajax('/' + ENV.APP.apiNamespace + '/forms/' + params.form_id + additionalParams, {
        method: 'GET',
        headers
      })
      .done(function(response) {
        let form = Ember.Object.create({
          id: response.data.id,
          destination: collection,
          title: response.data.attributes.title,
          contact: response.data.attributes.contact,
          description: response.data.attributes.description,
          children: deserializeChildren(response.data.attributes.children)
        });
        
        let depositorEmailBlock = Ember.Object.create({
          type: 'email',
          key: DEPOSITOR_EMAIL_KEY,
          label: 'Depositor\'s Email Address',
          required: true
        });
        
        if (response.meta.mail) {
          depositorEmailBlock.set('defaultValue', response.meta.mail);
        }
        
        if (ENV.APP.spoofMail) {
          depositorEmailBlock.set('defaultValue', ENV.APP.spoofMail);
        }
        
        if (Ember.isArray(form.get('children'))) {
          form.get('children').push(depositorEmailBlock);
        }
        
        let deposit = Ember.Object.create({
          authorized: response.meta.authorized,
          debug: response.meta.debug,
          form: form,
          entry: ObjectEntry.create({ block: form })
        });
        
        resolve(deposit);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        reject(new Error(errorThrown));
      });
    });
  },
  
  submit(deposit) {
    let payload = buildPayload(deposit);
    let depositCollection = location.href;
    let isAdminForm = (/adminOnly/.test(depositCollection)) ? true : false;
    let results = {
      path: depositCollection,
      admin: isAdminForm
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
      .done(function() {
        results.success = true;
        resolve(results);
      })
      .fail(function() {
        results.success = false;
        resolve(results);
      });
    });
  },
  
  debug(deposit) {
    let payload = buildPayload(deposit);
    
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let headers = {};
      if (ENV.APP.spoofRemoteUser) {
        headers['remote_user'] = ENV.APP.spoofRemoteUser;
      }
    
      $.ajax('/' + ENV.APP.apiNamespace + '/deposits/debug', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers
      })
      .done(function(response) {
        resolve(response);
      })
      .fail(function() {
        reject();
      });
    });
  }
});
