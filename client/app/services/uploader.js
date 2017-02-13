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

/**
 * @class Upload
 */
const Upload = Ember.Object.extend(Ember.Evented, {
  _start() {
    let formData = new FormData();
    formData.append('file', this.get('_file'), this.get('name'));
    
    this.xhr = new XMLHttpRequest();
    
    this.xhr.upload.onprogress = (e) => {
      let { loaded, total } = e;
      let fraction;
      
      if (total > 0) {
        fraction = loaded / total;
      } else {
        fraction = 0;
      }
      
      this.set('progress', Ember.Object.create({ loaded, total, fraction }));
    };
    
    this.xhr.upload.onerror = () => {
      this.trigger('error');
      this.set('error', true);
      this.set('loading', false);
    };
    
    this.xhr.onload = () => {
      if (this.xhr.status === 200) {
        let json = JSON.parse(this.xhr.responseText);
        
        // TODO: replace with Ember.assign after upgrading to 2.5
        let response = json.data.attributes;
        response.id = json.data.id;
        
        this.trigger('complete', response);
        this.set('response', response);
        this.set('loading', false);
      } else {
        this.trigger('error');
        this.set('error', true);
        this.set('loading', false);
      }
    };
    
    this.xhr.open('POST', '/' + ENV.APP.apiNamespace + '/uploads', true);
    
    if (ENV.APP.spoofRemoteUser) {
      this.xhr.setRequestHeader('remote_user', ENV.APP.spoofRemoteUser);
    }
    
    this.xhr.send(formData);

    this.set('progress', Ember.Object.create({ loaded: 0, total: 0 }));
    this.set('loading', true);
  },
  
  /**
    The upload completed.
  
    @event complete
    @param Object The response from the upload API.
  */
  
  /**
    An error occurred while uploading.
  
    @event error
  */
  
  /**
    Object representing the current upload progress.
  
    @property progress
    @type Ember.Object
  */
  
  /**
    Is this upload loading?
  
    @property loading
    @type Boolean
  */
  
  /**
    Cancel this upload.
    
    @method cancel
  */
  cancel() {
    this.xhr.abort();
    this.set('loading', false);
  },
  
  /**
    Try this upload again.
    
    @method retry
  */
  retry() {
    this._start();
  }
});

/**
  @class UploaderService
*/
export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this.set('uploads', []);
  },
  
  /**
    A list of the uploads attempted via the upload method.
    
    @property uploads
    @type Array
  */
  
  /**
    Attempt to upload a file.
    
    @method upload
    @param {File} file
    @return {Upload} The Upload instance representing the attempt to upload this file.
  */
  upload: function(file) {
    let upload = Upload.create({
      _file: file,
      name: file.name,
      size: file.size
    });

    upload._start();
    this.get('uploads').pushObject(upload);

    return upload;
  },
  
  /**
    Are any of the uploads loading?
    
    @property anyLoading
    @type {Boolean}
  */
  anyLoading: Ember.computed('uploads.@each.loading', function() {
    return this.get('uploads').some(upload => upload.get('loading'));
  })
});
