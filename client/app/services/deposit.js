// Copyright 2017 The University of North Carolina at Chapel Hill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import Ember from 'ember';
import ENV from 'therapy-dog/config/environment';
import ObjectEntry from 'therapy-dog/utils/object-entry';
import * as formUtils from 'therapy-dog/utils/get-parameter';
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
  let sendEmailReceipt = deposit.get('form.sendEmailReceipt');


  let depositorEmail = values[DEPOSITOR_EMAIL_KEY];
  delete values[DEPOSITOR_EMAIL_KEY];

  return {
    form: deposit.get('form.id'),
    destination: deposit.get('form.destination'),
    addAnother: deposit.get('form.addAnother'),
    addAnotherText: deposit.get('form.addAnotherText'),
    sendEmailReceipt: sendEmailReceipt,
    values,
    depositorEmail
  };
}

export default Ember.Service.extend({
  get(formId) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let headers = {};

      if (ENV.APP.spoofRemoteUser) {
        headers['remote_user'] = ENV.APP.spoofRemoteUser;
      }

      let collection = formUtils.parameterValue('collection');
      let adminOnly = formUtils.parameterValue('adminOnly');
      let additionalParams = '';

      if (adminOnly === 'true') {
        additionalParams += '?adminOnly=' + adminOnly;
      }

      $.ajax('/' + ENV.APP.apiNamespace + '/forms/' + formId + additionalParams, {
        method: 'GET',
        headers
      })
      .done(function(response) {
        let sendEmailReceipt = (response.data.attributes.sendEmailReceipt !== undefined) ? response.data.attributes.sendEmailReceipt : true;
        let form = Ember.Object.create({
          id: response.data.id,
          destination: collection,
          title: response.data.attributes.title,
          addAnother: response.data.attributes.addAnother,
          addAnotherText: response.data.attributes.addAnotherText,
          sendEmailReceipt: sendEmailReceipt,
          contact: response.data.attributes.contact,
          description: response.data.attributes.description,
          children: deserializeChildren(response.data.attributes.children)
        });

        let depositor = null;

        let depositorEmailBlock = Ember.Object.create({
          type: 'email',
          key: DEPOSITOR_EMAIL_KEY,
          label: 'Depositor\'s Email Address',
          required: true,
          hide : (!sendEmailReceipt) ? true : false
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
          entry: ObjectEntry.create({ block: form }),
          depositor: depositor
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
    let isAdminForm = (formUtils.parameterValue('adminOnly') === 'true') ? true : false;
    let addAnother = (payload.addAnother !== undefined) ? payload.addAnother : false;
    let addAnotherText = (payload.addAnotherText !== undefined) ? payload.addAnotherText : 'work';

    let results = {
      path: depositCollection,
      admin: isAdminForm,
      addAnother: addAnother,
      addAnotherText: addAnotherText,
      sendEmailReceipt: payload.sendEmailReceipt
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
