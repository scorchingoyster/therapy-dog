# Mailer testing

The development configuration sets the SMTP_CONNECTION_URL property to "smtp://localhost:1025". This is intended for use with the default configuration of [MockSMTP](http://www.mocksmtpapp.com), a macOS utility for testing applications that send email.

As an alternative, if MockSMTP or something like it is unavailable, this project contains a small script that sets up an SMTP server on port 1025. It prints everything it receives to the console. To use that script:

    node server/scripts/smtp-server.js

Mailers can be tested in development by submitting a deposit, but there is also a script for testing them in isolation:

    node server/scripts/test-deposit-mail.js

This script sends a deposit receipt and notification using the form server/data/forms/article.json and the input in server/data/input/article.json.
