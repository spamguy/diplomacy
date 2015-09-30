module.exports = function(agenda, core) {
    /**
     * Boots players who have not submitted finalised orders before the deadline + grace period.
     * @param  {Job} 'job' The AgendaJS job.
     */
    agenda.define('civildisorder', function(job, done) {
        return done();
    });
};
