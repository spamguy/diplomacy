'use strict';

var path = require('path'),
    nodemailer = require('nodemailer'),
    wellknown = require('nodemailer-wellknown'),
    EmailTemplate = require('email-templates').EmailTemplate,
    templatesDir = path.resolve(__dirname, 'templates');

var seekrits;
try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
    seekrits = require('../config/local.env.sample');
}

// errors
var EmailAddressRequiredError = new Error('An email address is required');

// transports
var defaultTransport = nodemailer.createTransport({
    service: 'mandrill',
    auth: {
        user: seekrits.mail.auth.user,
        pass: seekrits.mail.auth.password
    }
});

module.exports = {
    sendOne: function(templateName, options, err) {
        if (!options.email)
            return err(EmailAddressRequiredError);
        var template = new EmailTemplate(path.resolve(templatesDir, templateName));
        template.render(options, function(templateErr, results) {
            if (templateErr)
                return err(templateErr);

            var transport = defaultTransport;
            transport.sendMail({
                from: seekrits.mail.defaultFromAddress,
                to: options.email,
                subject: options.subject,
                html: results.html,
                text: results.text
            }, function(responseErr, responseStatus) {
                if (responseErr)
                    return err(responseErr);
                else
                    console.log('...done!');
            });
        });
    }
}
