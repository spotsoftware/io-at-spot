'use strict';

angular.module('ioAtSpotApp')
    .factory('Invites', ['$resource',
        function ($resource) {
            return $resource(
                '/api/organizations/:organizationId/invites/:id', {
                    organizationId: '@organizationId',
                    id: '@id'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    },
                    detail: {
                        method: 'GET',
                        isArray: false
                    },
                    add: {
                        method: 'POST',
                        isArray: false
                    },
                    accept: {
                        method: 'PUT',
                        isArray: false
                    },
                    remove: {
                        method: 'DELETE',
                        isArray: false
                    }
                });
    }]);