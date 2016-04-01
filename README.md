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

## Dependencies

### `server/`

Always commit the source code of production dependencies (those listed in the "dependencies" key in server/package.json). Add the files to server/node_modules and server/package.json in one commit. It should look like this: "Add \'name\' dependency to server." or "Remove \'name\' dependency from server."

Do not add production dependencies with native addons.

Do not commit the source code of devDependencies, just the addition to server/package.json and a entry in server/.gitignore. Add this in a separate commit. It should look like this: "Add \'name\' devDependency to server."

Changes to code should be in separate commits, after adding the dependency. This makes reviewing a merge request that involves dependencies a little easier, since we can look at our code separately.

`git log --oneline` should look like this: (most recent at top)

    ddddddd Use xpath expressions in a test or something.
    ccccccc Add 'xpath' devDependency to server.
    bbbbbbb Right-pad output instead.
    aaaaaaa Remove 'left-pad' dependency from server.
    1234567 Ensure output is left-padded.
    abcdefg Add 'left-pad' dependency to server.

### `client/`

Do not commit the source code for npm dependencies.

Always commit Bower components and dependencies in client/vendor. Add the change to client/bower.json and client/bower_components in one commit. Use separate commits for code and dependency changes.
