'use strict';

angular.module('userService', ['LocalStorageModule'])
.factory('userService', ['localStorageService', 'socketService', '$q',
function(localStorageService, socketService, $q) {
    var _user;

    return {
        isAuthenticated: function() {
            return !!localStorageService.get('token');
        },

        getToken: function() {
            return localStorageService.get('token');
        },

        setToken: function(token) {
            localStorageService.set('token', token);
        },

        getCurrentUserID: function() {
            return localStorageService.get('currentUserID');
        },

        getCurrentUser: function() {
            return _user;
        },

        setCurrentUser: function(userID, force) {
            var userPromise = $q(function(resolve) { return _user; });
            if (userID)
                localStorageService.set('currentUserID', userID);
            else
                userID = this.getCurrentUserID();

            // Populate or refresh user if logged in.
            if (userID || (_user && force)) {
                userPromise = this.getUser(userID);

                userPromise.then(function(user) {
                    _user = user;
                });
            }

            return userPromise;
        },

        getUser: function(userID) {
            return $q(function(resolve) {
                socketService.socket.emit('user:get', {
                    ID: userID
                }, function(user) {
                    resolve(user);
                });
            });
        },

        clearUser: function() {
            localStorageService.clearAll();
            _user = null;
        }
    };
}]);
