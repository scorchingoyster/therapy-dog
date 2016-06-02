'use strict';

const Arrow = require('../arrow');

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
