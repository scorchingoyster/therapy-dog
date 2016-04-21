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
        this.get('entry.value').pushObject(response);
      } else {
        this.set('entry.value', response);
      }
    });

    this.get('uploads').pushObject(upload);
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
      this.get("uploads").removeObject(upload);
    },

    retry(upload) {
      upload.retry();
    },

    remove(upload) {
      if (this.get('isMultiple')) {
        this.get('entry.value').removeObject(upload.response);
      } else {
        this.set('entry.value', null);
      }

      this.get('uploads').removeObject(upload);
    },

    focusEntry() {
      this.$('input').focus();
    }
  }
});
