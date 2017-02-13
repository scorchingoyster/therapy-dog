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
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  init() {
    this._super(...arguments);
    this.set('uploads', []);
  },

  classNames: ['block', 'file'],
  classNameBindings: ['required', 'invalid', 'isMultiple:multiple'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),
  isMultiple: Ember.computed.alias('entry.block.multiple'),
  
  uploader: Ember.inject.service(),

  didReceiveAttrs() {
    this._super(...arguments);

    if (this.get('entry.block.multiple')) {
      if (!this.get('entry.value')) {
        this.set('entry.value', []);
      }
    }
  },

  acceptsNewUpload: Ember.computed('uploads.length', 'isMultiple', function() {
    let count = this.get('uploads.length'), multiple = this.get('isMultiple');
    
    if (!multiple && count > 0) {
      return false;
    } else {
      return true;
    }
  }),
  
  uploadFile: function(file) {
    let upload = this.get('uploader').upload(file);

    upload.on('complete', (response) => {
      if (this.get('isMultiple')) {
        this.get('entry.value').pushObject(response.id);
      } else {
        this.set('entry.value', response.id);
      }

      if (!this.get('isMultiple')) {
        Ember.run.scheduleOnce('afterRender', this, function() {
          this.$('button').focus();
        });
      }
    });

    upload.on('error', () => {
      if (!this.get('isMultiple')) {
        Ember.run.scheduleOnce('afterRender', this, function() {
          this.$('button').focus();
        });
      }
    });

    this.get('uploads').pushObject(upload);

    if (!this.get('isMultiple')) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.$('button').focus();
      });
    }
  },
  
  removeUpload(upload) {
    let uploads = this.get('uploads');
    let removedIndex = uploads.indexOf(upload);
    uploads.removeObject(upload);

    if (!this.get('isMultiple')) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.$('input[type="file"]').focus();
      });
    } else {
      let focusIndex = -1;

      if (removedIndex - 1 >= 0) {
        focusIndex = removedIndex - 1;
      } else if (removedIndex < uploads.length) {
        focusIndex = removedIndex;
      }
      
      Ember.run.next(this, function() {
        if (focusIndex === -1) {
          this.$('input').focus();
        } else {
          this.$('.upload').eq(focusIndex).find('button, input').eq(0).focus();
        }
      });
    }
  },

  actions: {
    choose: function(fileList) {
      if (fileList.length > 0) {
        if (this.get('isMultiple')) {
          for (let i = 0; i < fileList.length; i++) {
            this.uploadFile(fileList[i]);
          }
        } else {
          this.get('uploads').clear();
          this.uploadFile(fileList[0]);
        }
      }
    },

    cancel(upload) {
      upload.cancel();
      this.removeUpload(upload);
    },

    retry(upload) {
      upload.retry();
    },

    remove(upload) {
      if (this.get('isMultiple')) {
        this.get('entry.value').removeObject(upload.response.id);
      } else {
        this.set('entry.value', null);
      }

      this.removeUpload(upload);
    },

    focusEntry() {
      this.$('input').focus();
    },
    
    focusInput() {
      this.$('.choose-file-wrapper').addClass('file-input-focus');
    },
    
    blurInput() {
      this.$('.choose-file-wrapper').removeClass('file-input-focus');
    }
  }
});
