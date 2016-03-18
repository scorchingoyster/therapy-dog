import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  init() {
    this._super(...arguments);
    this.set('uploads', []);
  },

  classNames: ['block', 'file'],
  classNameBindings: ['required', 'invalid', 'multiple'],
  required: Ember.computed.alias('entry.required'),
  invalid: Ember.computed.alias('entry.invalid'),
  
  focusOut: function() {
    this.set('entry.attempted', true);
  },
  
  uploader: Ember.inject.service(),
  state: 'empty',

  didReceiveAttrs() {
    this._super(...arguments);

    if (this.get('entry.block.multiple')) {
      if (!this.get('entry.value')) {
        this.set('entry.value', []);
      }
    }
  },

  acceptsNewUpload: Ember.computed('uploader.length', 'multiple', function() {
      var count = this.get("uploader.length"), multiple = this.get("entry.block.multiple");

      if (!multiple && count > 0) {
        return false;
      } else {
        return true;
      }
  }),

  actions: {
    choose: function(fileList) {
      if (this.get('state') === 'empty' && fileList.length > 0) {
        var uploader = this.get('uploader');
        var isMultiple = this.get('entry.block.multiple');

        for (var i = 0; i < fileList.length; i++) {
          var upload = uploader.upload(fileList[i]);

          upload.on('complete', (response) => {
            if(isMultiple) {
              this.get('entry.value').pushObject(response);
            } else {
              this.set('entry.value', response);
            }
          });

          this.get("uploads").pushObject(upload);

          if (isMultiple === undefined || !isMultiple) {
            break;
          }
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
       if(this.get('entry.block.multiple')) {
         this.get('entry.value').removeObject(upload.response);
       } else {
         this.set('entry.value', null);
       }

      this.get("uploads").removeObject(upload);
    },

    focusEntry() {
      this.$('input').focus();
    }
  }
});
