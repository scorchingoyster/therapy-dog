'use strict';

const assert = require('assert');
const Form = require('../../lib/models/form');
const collectNotificationRecipientEmails = require('../../lib/deposit/collect-notification-recipient-emails');

describe('collectNotificationRecipientEmails', function() {
  it('should collect using strings and lookups', function() {
    let form = new Form('test', {
      destination: 'uuid:1234',
      title: 'Test',
      notificationRecipientEmails: [
        { type: 'string', value: 'test@example.com' },
        { type: 'string', value: 'another@example.org' },
        { type: 'lookup', path: ['email'] }
      ],
      children: [
        { type: 'email', key: 'email' },
        { type: 'file', key: 'thesis' }
      ],
      bundle: {
        type: 'single',
        file: {
          upload: 'thesis'
        }
      },
      metadata: []
    });

    let values = {
      email: 'blah@example.net'
    };

    assert.deepEqual(collectNotificationRecipientEmails(form, values), ['test@example.com', 'another@example.org', 'blah@example.net']);
  });

  it('should collect using an array in a vocabulary term', function() {
    let form = new Form('test', {
      destination: 'uuid:1234',
      title: 'Test',
      notificationRecipientEmails: [
        { type: 'lookup', path: ['major', 'emails'] }
      ],
      children: [
        { type: 'select', key: 'major', options: 'majors' },
        { type: 'file', key: 'thesis' }
      ],
      bundle: {
        type: 'single',
        file: {
          upload: 'thesis'
        }
      },
      metadata: []
    });

    // These are transformed values -- there is no 'majors' vocabulary fixture.
    let values = {
      major: { name: 'Basket Weaving', emails: ['b@example.com', 'c@example.com'] }
    };

    assert.deepEqual(collectNotificationRecipientEmails(form, values), ['b@example.com', 'c@example.com']);
  });

  it('should return an empty array if the property is absent', function() {
    let form = new Form('test', {
      destination: 'uuid:1234',
      title: 'Test',
      children: [
        { type: 'file', key: 'thesis' }
      ],
      bundle: {
        type: 'single',
        file: {
          upload: 'thesis'
        }
      },
      metadata: []
    });

    assert.deepEqual(collectNotificationRecipientEmails(form, {}), []);
  });
});
