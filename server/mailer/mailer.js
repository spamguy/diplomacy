'use strict';

var path = require('path'),
    async = require('async'),
    nodemailer = require('nodemailer'),
    sendgridTransport = require('nodemailer-sendgrid-transport'),
    EmailTemplate = require('email-templates').EmailTemplate,
    templatesDir = path.resolve(__dirname, 'templates'),
    EmailAddressRequiredError = new Error('An email address is required'),
    seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
    logger = require('./../logger');

module.exports = {
    sendOne: sendOne,
    sendMany: sendMany
};

function sendOne(templateName, options, cb) {
    if (!options.email)
        return cb(EmailAddressRequiredError);
    var template = new EmailTemplate(path.resolve(templatesDir, templateName));
    template.render(options, function(templateErr, results) {
        if (templateErr)
            return cb(templateErr);

        var apiOptions = {
                auth: {
                    api_key: seekrits.get('mail:auth:password')
                }
            },
            transport = nodemailer.createTransport(sendgridTransport(apiOptions));

        logger.info('Sending mail \'' + templateName + '\' to ' + options.email);
        transport.sendMail({
            from: seekrits.get('mail:defaultFromAddress'),
            to: options.email,
            subject: options.subject,
            html: results.html,
            text: results.text
        }, cb);
    });
}

function sendMany(templateName, optionses, cb) {
    async.each(optionses, function(options, callback) {
        sendOne(templateName, options, callback);
    }, cb);
}
