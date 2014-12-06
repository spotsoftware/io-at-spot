'use strict';

angular.module('ioAtSpotApp')
    .factory('WorkTimeEntries', ['$resource',
        function ($resource) {
            return $resource(
                '/api/organizations/:organizationId/workTimeEntries/:workTimeEntryId', {
                    organizationId: '@organizationId',
                    workEntryId: '@workTimeEntryId'
                }, {
                    query: {
                        url: '/api/organizations/:organizationId/workTimeEntries?page=:page',
                        method: 'POST',
                        params: {
                            organizationId: '@organizationId',
                            page: '@page'
                        },
                        isArray: false //returns an object (that also contains an array)
                    },
                    update: {
                        method: 'PUT',
                        params: {
                            organizationId: '@organizationId',
                            workEntryId: '@workTimeEntryId'
                        },
                        isArray: false
                    },
                    create: {
                        url: '/api/organizations/:organizationId/workTimeEntries/new',
                        method: 'POST',
                        params: {
                            organizationId: '@organizationId'
                        },
                        isArray: false
                    },
                    delete: {
                        method: 'DELETE',
                        params: {
                            organizationId: '@organizationId',
                            workEntryId: '@workTimeEntryId'
                        },
                        isArray: false
                    }
                });
    }]);