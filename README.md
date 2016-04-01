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

## How to add dependencies

The source code for some dependencies is added to the repository:

  - for the client, Bower components and anything in the vendor/ directory
  - for the server, production npm dependencies (those listed in server/package.json under "dependencies")

We don't add the source code for development npm dependencies (those listed in server/package.json under "devDependencies"), which are anything we need for development (for example, running tests) but not for actually running the client or server.

Add or remove dependencies separately from code changes. This makes reviewing a merge request a little easier, since we can look at our own code in separate commits.

`git log --oneline` should look like this: (most recent at top)

    bbbbbbb NIH left-pad.
    aaaaaaa Remove 'left-pad' dependency from server.
    1234567 Ensure output is left-padded.
    abcdefg Add 'left-pad' dependency to server.

### To add a Bower component to client

    bower install --save DOMPurify
    git add bower.json bower_components/DOMPurify
    git commit -m "Add 'DOMPurify' Bower component to client."

### To add a vendor dependency to client

    git add vendor/normalize.css
    git commit -m "Add 'normalize.css' vendor dependency to client."

### To add a production npm dependency to server

    npm install --save archiver
    git add package.json node_modules/archiver
    git commit -m "Add 'archiver' dependency to server."

### To add a development npm dependency to server

    npm install --save-dev xmldom
    echo "node_modules/xmldom" >> .gitignore
    git add package.json .gitignore
    git commit -m "Add 'xmldom' devDependency to server."
