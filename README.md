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

Copy example the example form and its vocabularies:

    make examples

In development, forms and vocabularies are kept in the server/data directory.

In order to test submission to the CDR development VM via SWORD, you'll need to set the `"destination"` property of this form to the PID of some container. The container must grant the "unc:app:lib:cdr:depositor:depositforms" group the "ingester" role. If you want to submit to the QA server instead, you'll also need to set the `SWORD_BASE_URL` environment variable.

Start the API server:

    make run-server

Start the client:

    make run-client

## Check before you commit

We don't have CI set up yet, so always run `make check` before committing.
