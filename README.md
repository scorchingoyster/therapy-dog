# Therapy Dog (Deposit Forms)

This is a Node.js and Ember application that provides:

  - flexible forms for collecting files and metadata,
  - an expression language for mapping form input to MODS and other XML schemas, and
  - routines for packaging and submitting METS deposits to the CDR.

## Setup

Install Node.js. If you are using Homebrew:

    brew install node

Install dependencies:

    make deps

Copy example the example form and its vocabularies:

    make examples

Start the API server:

    make run-server

Start the client:

    make run-client

## Check before you commit

We don't have CI set up yet, so always run `make check` before committing.
