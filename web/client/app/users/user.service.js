'use strict';

angular.module('ioAtSpotApp')
    .factory('Users', ['$resource',
        function ($resource) {
            return $resource(
                '/api/users/:userId', {
                    userId: '@userId'
                }, {
                    query: {
                        url: '/api/users/',
                        method: 'POST',
                        isArray: true
                    },

                    update: {
                        url: '/api/users/me',
                        method: 'PUT',
                        isArray: false
                    }
                }
            );
}]);