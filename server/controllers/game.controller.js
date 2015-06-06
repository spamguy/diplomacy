'use strict';

var seekrits;
try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('../config/local.env.sample');
}

var auth = require('../auth');

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('game', {
        userlist: function(req, res) {
            var options = { playerID: req.data.playerID };
            var games = core.game.list(options, function(err, games) {
                return res.json(games);
            });
        },

        list: function(req, res) {
            var games = core.game.list({ }, function(err, games) {
                return res.json(games);
            });
        },

        listopen: function(req, res) {
            var games = core.game.listOpen({ }, function(err, games) {
                return res.json(games);
            });
        },

        moves: function(req, res) {
        },

        join: function(req, res) {
            var gameID = req.data.gameID;

            core.game.list({ ID: gameID }, function(err, games) {
                var game = games[0];
                // make sure this person is actually allowed to join

                // join

                // broadcast join to others subscribed to game
                var gameData = { gamename: game.name };
                req.socket.broadcast.to(gameID).emit('game:join:success', gameData);

                // if everyone is here, signal the game can (re)start
                if (game.playerCount === game.maxPlayers)
                    req.socket.emit('game:start', { gameID: gameID });
            });
        },

        leave: function(req, res) {
            var gameID = req.data.gameID,
                game = core.game.list({ ID: gameID });

            // mete out punishment to players leaving mid-game

            // broadcast leave to others subscribed to game
            req.socket.broadcast.to(gameID).emit('user:leave:success', { gamename: game.name });

            // signal the game should handle the situation
            req.socket.emit('game:stop', { gameID: gameID });
        },

        watch: function(req, res) {
            var userID = req.socket.tokenData.id;

            // get list of subscribed games and join them as socket.io rooms
            core.game.list({
                playerID: userID,
                isActive: true
            }, function(err, games) {
                for (var g = 0; g < games.length; g++) {
                    req.socket.join(games[g]._id);
                    console.log(userID + ' joined game room ' + games[g]._id);
                }
            });
        },

        start: function(req, res) {
            // new games only: create first season

            // all games: schedule next adjudication
        },

        stop: function(req, res) {

        }
    });
};
