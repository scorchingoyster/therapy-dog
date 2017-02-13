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
'use strict';

const Arrow = require('../arrow');

/**
 * Evaluate and return the results of the Arrow expressions in the form's notificationRecipientEmails property, if present.
 * @function
 * @name collectNotificationRecipientEmails
 * @param {Form} form
 * @param {Object} values
 * @return {Array}
 */
module.exports = function(form, values) {
  if (form.notificationRecipientEmails) {
    return form.notificationRecipientEmails.reduce(function(recipients, expression) {
      let arrow = new Arrow(expression);
      return recipients.concat(arrow.evaluate(values));
    }, []);
  } else {
    return [];
  }
};
