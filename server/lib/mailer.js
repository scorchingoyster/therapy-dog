'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const Handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const stubTransport = require('nodemailer-stub-transport');
const config = require('../config');

let transportOptions;
if (config.MAILER_CONNECTION_URL === 'stub') {
  let stub = stubTransport();
  transportOptions = stub;
  exports.stubTransport = stub;
} else {
  transportOptions = config.MAILER_CONNECTION_URL;
}

const transport = nodemailer.createTransport(transportOptions);

Handlebars.registerPartial('items-list-html', fs.readFileSync(path.join(__dirname, `../templates/-items-list-html.hbs`)).toString());
Handlebars.registerPartial('items-list-text', fs.readFileSync(path.join(__dirname, `../templates/-items-list-text.hbs`)).toString());
Handlebars.registerPartial('css', fs.readFileSync(path.join(__dirname, `../templates/-css.hbs`)).toString());

function getTemplate(name, part) {
  return Handlebars.compile(fs.readFileSync(path.join(__dirname, `../templates/${name}.${part}.hbs`)).toString());
}

const depositReceiptSender = transport.templateSender({
  render: function(context, callback) {
    let subjectTemplate = getTemplate('deposit-receipt', 'subject');
    let textTemplate = getTemplate('deposit-receipt', 'text');
    let htmlTemplate = getTemplate('deposit-receipt', 'html');

    callback(null, {
      subject: subjectTemplate(context),
      text: textTemplate(context),
      html: htmlTemplate(context)
    });
  }
}, {
  from: config.FROM_EMAIL
});

const depositNotificationSender = transport.templateSender({
  render: function(context, callback) {
    let subjectTemplate = getTemplate('deposit-notification', 'subject');
    let textTemplate = getTemplate('deposit-notification', 'text');
    let htmlTemplate = getTemplate('deposit-notification', 'html');

    callback(null, {
      subject: subjectTemplate(context),
      text: textTemplate(context),
      html: htmlTemplate(context)
    });
  }
}, {
  from: config.FROM_EMAIL
});

function flattenSummary(blocks, summary) {
  return blocks.map(function(block) {
    let value = summary[block.key];

    if (block.type === 'section') {
      if (block.repeat) {
        return {
          section: true,
          repeat: true,
          label: block.label,
          value: value.map(function(item) {
            return flattenSummary(block.children, item);
          })
        };
      } else {
        return {
          section: true,
          label: block.label,
          value: flattenSummary(block.children, value)
        };
      }
    } else if (block.type === 'checkboxes') {
      if (value.length === 0) {
        return { label: block.label, value: '(none)' };
      } else {
        return { label: block.label, value: value.join(', ') };
      }
    } else if (block.type === 'file') {
      if (block.multiple) {
        if (value.length === 0) {
          return { label: block.label, value: '(none)' };
        } else {
          return { label: block.label, value: value.map(u => u.name).join(', ') };
        }
      } else {
        return { label: block.label, value: value.name };
      }
    } else if (block.type === 'agreement') {
      return { label: block.name, value: 'Accepted' };
    } else {
      return { label: block.label, value };
    }
  });
}

exports.sendDepositReceipt = function(form, summary, address) {
  return Promise.try(function() {
    let items = flattenSummary(form.children, summary);

    return depositReceiptSender({ to: address }, { form, items });
  });
};

exports.sendDepositNotification = function(form, summary, addresses) {
  return Promise.try(function() {
    let items = flattenSummary(form.children, summary);

    if (addresses.length > 0) {
      return depositNotificationSender({ to: addresses }, { form, items });
    }
  });
};
