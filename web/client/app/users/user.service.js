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
                        method: 'GET',
                        isArray: true
                    },
                    detail: {
                        url: '/api/users/:id/',
                        method: 'GET',
                        params: {
                            id: '@id'
                        },
                        isArray: false
                    },
                    create: {
                        url: '/api/users/',
                        method: 'POST',
                        isArray: false
                    },
                    update: {
                        url: '/api/users/me',
                        method: 'PUT',
                        isArray: false
                    }
                }
            );
}]);
