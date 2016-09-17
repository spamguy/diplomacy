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

        setCurrentUser: function(userID, callback) {
            if (userID)
                localStorageService.set('currentUserID', userID);
            else
                userID = this.getCurrentUserID();

            if (_user || !userID) {
                callback();
                return;
            }

            this.getUser(userID, function(user) {
                _user = user;
                callback();
            });
        },

        getUser: function(userID, callback) {
            socketService.socket.emit('user:get', { ID: userID }, callback);
        },

        clearUser: function() {
            localStorageService.clearAll();
            _user = null;
        }
    };
}]);
