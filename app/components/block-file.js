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
  
  state: 'empty',
  isEmpty: Ember.computed.equal('state', 'empty'),
  isProgress: Ember.computed.equal('state', 'progress'),
  isError: Ember.computed.equal('state', 'error'),
  isComplete: Ember.computed.equal('state', 'complete'),
  
  upload() {
    var formData = new FormData();
    formData.append('file', this.get('file'), this.get('file.name'));
    
    this.xhr = new XMLHttpRequest();
    this.xhr.responseType = 'json';
    
    this.xhr.upload.onprogress = (e) => {
      this.send('progress', e.loaded, e.total);
    };
    
    this.xhr.upload.onerror = () => {
      this.send('error');
    };
    
    this.xhr.onload = () => {
      if (this.xhr.status === 200) {
        this.send('complete', this.xhr.response);
      } else {
        this.send('error');
      }
    };
    
    this.xhr.open('POST', '/api/uploads', true);
    this.xhr.send(formData);
    
    this.set('state', 'progress');
    this.set('progress', Ember.Object.create({ total: this.get('file.size'), loaded: 0, ratio: 0 }));
  },
  
  actions: {
    choose(files) {
      if (files.length > 0) {
        let file = files[0];
        this.set('file', file);
        
        this.upload();
      }
    },
    
    cancel() {
      this.xhr.abort();
      
      this.set('state', 'empty');
      this.set('progress', null);
      this.set('file', null);
    },
    
    progress(loaded, total) {
      let ratio;
      
      if (total > 0) {
        ratio = loaded / total;
      } else {
        ratio = 0;
      }
      
      this.set('progress', { loaded, total, ratio });
    },
    
    error() {
      this.set('state', 'error');
    },
    
    retry() {
      this.upload();
    },
    
    complete(response) {
      this.set('state', 'complete');
      this.set('entry.value', response);
      this.set('progress', null);
    },
    
    remove() {
      this.set('state', 'empty');
      this.set('entry.value', null);
      this.set('file', null);
      this.set('progress', null);
    },

    focusEntry() {
      this.$('input').focus();
    }
  }
});
