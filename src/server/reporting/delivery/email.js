'use strict';

var nodemailer = require('nodemailer');
var through2 = require('through2');
var when = require('when');

// TODO: How should the email configuration be located? Where should we put it?
// How do we initialize this module?
var emailConfig = require('./emailconfig');

module.exports.handle = function(stream, req, res, next) {
  var whenHtmlIsReady = when.promise(function(resolve, reject) {
    stream.pipe(through2(resolve)).on('error', reject);
  });

  // TODO: This is almost complete. The mail object will need a subject and
  // body but more importantly a transport. Likely this transport can be
  // sendmail while in dev mode but should be smtp or a dedicated smtp service
  // like sendgrid when in production.
  whenHtmlIsReady
    .then(function(data) {
      var mail = {
        from: emailConfig.from,
        to: req.body.emailTo,
        attachments: {}
      };
      mail.attachments[data.activity + '.html'] = data.rendered;

      nodemailer.sendMail(mail);
    })
    .catch(function(err) {
      next(err);
    });
};
