'use strict';

var path = require('path'),
    nodemailer = require('nodemailer'),
    wellknown = require('nodemailer-wellknown'), // eslint-disable-line
    EmailTemplate = require('email-templates').EmailTemplate,
    templatesDir = path.resolve(__dirname, 'templates'),
    EmailAddressRequiredError = new Error('An email address is required'),
    seekrits;

try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('../config/local.env.sample');
}

module.exports = {
    sendOne: function(templateName, options, cb) {
        if (!options.email)
            return cb(EmailAddressRequiredError);
        var template = new EmailTemplate(path.resolve(templatesDir, templateName));
        template.render(options, function(templateErr, results) {
            if (templateErr)
                return cb(templateErr);

            var transport = nodemailer.createTransport({
                service: 'mandrill',
                auth: {
                    user: seekrits.mail.auth.user,
                    pass: seekrits.mail.auth.password
                }
            });
            transport.sendMail({
                from: seekrits.mail.defaultFromAddress,
                to: options.email,
                subject: options.subject,
                html: results.html,
                text: results.text
            }, cb());
        });
    }
};
