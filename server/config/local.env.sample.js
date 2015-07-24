module.exports = {
    DOMAIN: 'http://localhost',
    SESSION_SECRET: 'stuff goes here',
    mongoURI: 'mongodb://localhost/diplomacy',
    mail: {
        auth: {
            user: 'email@email.com',
            password: 'APIkey'
        },
        defaultFromAddress: 'dipl.io Mailer <dipl.io@dipl.io>'
    }
};
