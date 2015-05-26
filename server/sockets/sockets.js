module.exports = function() {
    var mongoose = require('mongoose'),
        app = this.app;

    app.io.route('login', {
        success: function(req, res) {
            var id = mongoose.Types.ObjectId(req.body.id);

            // get user's games and 'join' each one like a chat room
            require('../models/game')(id).Game
                .find({ 'players.player_id': id }, function(err, games) {
                    for (var g = 0; g < games.length; g++) {
                        var game = games[g];
                        req.socket.join(game._id);
                        console.log(id + ': Joined room ' + game._id);
                    }
                });
        }
    });

    return app;
};
