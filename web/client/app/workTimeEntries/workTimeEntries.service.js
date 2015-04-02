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
                        url: '/api/organizations/:organizationId/workTimeEntries?page=:page&from=:from&to=:to&type=:type&members=:members',
                        method: 'GET',
                        params: {
                            from: '@from',
                            members: '@members',
                            organizationId: '@organizationId',
                            page: '@page',
                            to: '@to',
                            type: '@type'
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
                        url: '/api/organizations/:organizationId/workTimeEntries/',
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