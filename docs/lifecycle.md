# From form definition to SWORD deposit

## Form definitions are stored in JSON and loaded from a directory

- FORMS_DIRECTORY configuration property in server/config/index.js
- Form model in server/lib/models/form.js
- findById utility function in server/lib/models/utils.js

## Form definitions may refer to vocabularies, also stored in JSON and loaded from a directory

- VOCABULARIES_DIRECTORY configuration property in server/config/index.js
- Vocabulary model in server/lib/models/vocabulary.js
- findById utility function in server/lib/models/utils.js

## The server has an JSON API endpoint for forms, provided by the `forms` handler

- "/forms/:id" route in server/lib/router.js
- "show" handler in server/lib/handlers/forms.js
- Form#resourceObject method in server/lib/models/form.js

## The client creates an object representing a deposit based on the id of the form requested

- DepositService#get in client/app/services/deposit.js

## The client associates form blocks with user input using *entries*

- client/app/utils/array-entry.js, client/app/utils/object-entry.js, client/app/utils/value-entry.js
- client/app/components/object-entry.js, client/app/templates/components/object-entry.hbs

## The client uploads files by making requests to the `upload` handler

- UploaderService#upload in client/app/services/uploader.js
- "create" handler in server/lib/handlers/uploads.js

## The client flattens entries and submits user input to the `deposit` handler

- client/app/utils/array-entry.js, client/app/utils/object-entry.js, client/app/utils/value-entry.js
- DepositService#submit in client/app/services/deposit.js
- "create" handler in server/lib/handlers/deposit.js

## The server validates and deserializes input from the client

- Form#transformValues method in server/lib/models/form.js

## The server creates a *bundle* from the deserialized input, which is an abstract representation of what to submit to the repository

- server/lib/deposit/generate-bundle/index.js

## A bundle optionally includes XML metadata mapped from user input

- server/lib/arrow/index.js, server/lib/arrow/models/xml.js

## The server creates a *submission* from the bundle, a map of names to files or Buffer objects

- server/lib/deposit/generate-submission.js

## The server creates a zip file from the submission and submits to the repository via SWORD

- server/lib/deposit/submit-zip.js

## The server sends a deposit receipt to the depositor and deposit notifications to notification recipients, as specified in the form definition

- server/lib/deposit/collect-notification-recipient-emails.js
- server/lib/mailer.js
