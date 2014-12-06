'use strict';

angular.module('ioAtSpotApp')
    .factory('Organizations', ['$resource',
        function ($resource) {
            return $resource(
                '/api/organizations/:organizationId', {
                    organizationId: '@organizationId'
                }, {
                    query: {
                        url: '/api/organizations/',
                        method: 'GET',
                        isArray: true //not paged
                    },
                    update: {
                        method: 'PUT',
                        params: {
                            organizationId: '@organizationId'
                        },
                        isArray: false
                    },
                    create: {
                        url: '/api/organizations/new',
                        method: 'POST',
                        isArray: false
                    },
                    delete: {
                        method: 'DELETE',
                        params: {
                            organizationId: '@organizationId'
                        },
                        isArray: false
                    },
                    readUid: {
                        url: '/api/organizations/:organizationId/readuid',
                        params: {
                            organizationId: '@organizationId'
                        },
                        method: 'GET',
                        isArray: false
                    }
                });
    }]);