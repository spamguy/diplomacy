'use strict';

var path = require('path'),
    nodemailer = require('nodemailer'),
    wellknown = require('nodemailer-wellknown'), // eslint-disable-line
    EmailTemplate = require('email-templates').EmailTemplate,
    templatesDir = path.resolve(__dirname, 'templates'),
    EmailAddressRequiredError = new Error('An email address is required'),
    seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json'));

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
                    user: seekrits.get('mail:auth:user'),
                    pass: seekrits.get('mail:auth:password')
                }
            });
            transport.sendMail({
                from: seekrits.get('mail:defaultFromAddress'),
                to: options.email,
                subject: options.subject,
                html: results.html,
                text: results.text
            }, cb());
        });
    }
};
