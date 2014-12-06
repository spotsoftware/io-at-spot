'use strict';

angular.module('ioAtSpotApp')
    .factory('Members', ['$resource',
        function ($resource) {
            return $resource(
                '/api/organizations/:organizationId/members/:id', {
                    organizationId: '@organizationId',
                    id: '@id'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    },
                    add: {
                        method: 'POST',
                        isArray: false
                    },
                    update: {
                        method: 'PUT',
                        isArray: false
                    },
                    remove: {
                        method: 'DELETE',
                        isArray: false
                    }
                });
    }]);