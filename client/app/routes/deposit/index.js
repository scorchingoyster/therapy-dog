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

export default Ember.Route.extend({
  deposit: Ember.inject.service(),
  
  renderTemplate: function(controller, model) {
    if (model.get('authorized')) {
      this.render('deposit/form', { model });
    } else {
      this.render('deposit/login', { model });
    }
  },
  
  actions: {
    deposit() {
      let deposit = this.modelFor('deposit');
      let promise = this.get('deposit').submit(deposit);
      
      this.render('deposit/loading');
      
      promise
      .then((result) => {
        deposit.set('result', result);
        this.render('deposit/result', { model: deposit });
      });
    }
  }
});
