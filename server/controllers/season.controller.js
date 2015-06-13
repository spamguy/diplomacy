'use strict';

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('season', {
        list: function(req, res) {
            var options = { gameID: req.data.gameID };

            var seasons = core.season.list(options, function(err, seasons) {
                return res.json(seasons);
            });
        }
    });
};
