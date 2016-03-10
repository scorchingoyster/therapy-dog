import Ember from 'ember';
import FocusEntryAction from 'therapy-dog/mixins/focus-entry-action';

export default Ember.Component.extend(FocusEntryAction, {
  classNames: ['block', 'file'],
  classNameBindings: ['required', 'invalid'],
  required: Ember.computed.alias('entry.block.required'),
  invalid: Ember.computed('entry.errors', 'entry.attempted', function() {
    return !Ember.isEmpty(this.get('entry.errors')) && this.get('entry.attempted');
  }),
  
  focusOut: function() {
    this.set('entry.attempted', true);
  },
  
  uploads: Ember.inject.service(),
  
  state: 'empty',
  isEmpty: Ember.computed.equal('state', 'empty'),
  isLoading: Ember.computed.equal('state', 'loading'),
  isError: Ember.computed.equal('state', 'error'),
  isComplete: Ember.computed.equal('state', 'complete'),
  
  actions: {
    choose(files) {
      if ((this.get('state') === 'empty' || this.get('state') === 'error') && files.length > 0) {
        let upload = this.get('uploads').upload(files[0]);
  
        upload.on('error', () => {
          this.set('state', 'error');
        });
  
        upload.on('complete', (response) => {
          this.set('entry.value', response);
          this.set('state', 'complete');
        });
  
        this.set('upload', upload);
        this.set('state', 'loading');
      }
    },
    
    cancel() {
      if (this.get('state') === 'loading') {
        let upload = this.get('upload');
        upload.cancel();
  
        this.set('upload', null);
        this.set('entry.value', null);
        this.set('state', 'empty');
      }
    },
    
    retry() {
      if (this.get('state') === 'error') {
        let upload = this.get('upload');
        upload.retry();
  
        this.set('state', 'loading');
      }
    },
    
    remove() {
      if (this.get('state') === 'complete') {
        this.set('upload', null);
        this.set('entry.value', null);
        this.set('state', 'empty');
      }
    },

    focusEntry() {
      this.$('input').focus();
    }
  }
});
