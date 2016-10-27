'use strict';

angular.module('userService', [])
.factory('userService', ['$localStorage', 'socketService', '$q',
function($localStorage, socketService, $q) {
    return {
        isAuthenticated: function() {
            return $localStorage.user;
        },

        // getToken: function() {
        //     return $localStorage.get('token');
        // },
        //
        // setToken: function(token) {
        //     $localStorage.set('token', token);
        // },

        getCurrentUserID: function() {
            return $localStorage.theUser.id;
        },

        // getCurrentUser: function() {
        //     return _user;
        // },
        //
        // setCurrentUser: function(userID, callback) {
        //     if (userID)
        //         localStorageService.set('currentUserID', userID);
        //     else
        //         userID = this.getCurrentUserID();
        //
        //     if (_user || !userID) {
        //         callback();
        //         return;
        //     }
        //
        //     this.getUser(userID, function(user) {
        //         _user = user;
        //         callback();
        //     });
        // },

        getUser: function(userID, callback) {
            socketService.socket.emit('user:get', { ID: userID }, callback);
        }

        // clearUser: function() {
        //     localStorageService.clearAll();
        //     _user = null;
        // }
    };
}]);
