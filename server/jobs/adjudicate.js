module.exports = function(agenda, core) {
    agenda.define('adjudicate', function(job, done) {
        var seasonID = job.attrs.data.seasonID;

        console.log('Adjudicating season ' + seasonID);

        return done();
    });
};
