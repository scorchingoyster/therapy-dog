# Therapy Dog (Deposit Forms)

This is a Node.js and Ember application that provides:

  - flexible forms for collecting files and metadata,
  - an expression language for mapping form input to MODS and other XML schemas, and
  - routines for packaging and submitting METS deposits to the CDR.

## Setup

Install Node.js. If you are using Homebrew:

    brew install node

Install Bower and ember-cli:

    npm install -g bower ember-cli

Install dependencies:

    make deps

Copy the .env.example file and modify FORMS_DIRECTORY, VOCABULARIES_DIRECTORY, and UPLOADS_DIRECTORY. These should be absolute paths to ./server/forms, ./server/vocabularies, and wherever you want to put uploaded files (eg, ./server/uploads).

    cp server/.env.example server/.env

Copy the example form and vocabularies:

    cp server/forms/test-form.json.example server/forms/test-form.json
    cp server/vocabularies/genre.json.example server/vocabularies/genre.json
    cp server/vocabularies/issuance.json.example server/vocabularies/issuance.json

In order to test submission to the CDR development VM via SWORD, you'll need to set the `"destination"` property of this form to the PID of some container. The container must grant the "unc:app:lib:cdr:depositor:depositforms" group the "ingester" role. If you want to submit to the QA server instead, you'll also need to change the `DEPOSIT_BASE_URL` variable in `server/.env`.

Start the API server:

    make run-server

Start the client:

    make run-client
