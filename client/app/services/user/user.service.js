'use strict';

angular.module('userService', [])
.factory('userService', ['$localStorage', 'socketService', '$q',
function($localStorage, socketService, $q) {
    return {
        isAuthenticated: function() {
            return !!$localStorage.theUser;
        },

        getCurrentUserID: function() {
            return $localStorage.theUser.id;
        },

        getUser: function(userID, callback) {
            socketService.socket.emit('user:get', { ID: userID }, callback);
        }
    };
}]);
