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
