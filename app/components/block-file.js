import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['block', 'file'],
  classNameBindings: ['required'],
  required: Ember.computed.alias('block.required'),
  
  actions: {
    select(files) {
      if (files.length > 0) {
        var formData = new FormData();
        
        var file = files[0];
        formData.append('file', file, file.name);
        
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            this.set('value', xhr.response);
            this.set('progress', null);
          }
        };
        
        xhr.open('POST', '/api/uploads', true);
        
        xhr.send(formData);
      }
    },
    
    clear() {
      this.set('value', null);
      this.set('progress', null);
    }
  }
});
