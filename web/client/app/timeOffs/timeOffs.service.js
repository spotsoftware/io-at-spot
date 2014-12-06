'use strict';

angular.module('ioAtSpotApp')
    .factory('TimeOffs', ['$resource',
        function ($resource) {
            return $resource(
                '/api/organizations/:organizationId/timeOffs/:timeOffId', {
                    organizationId: '@organizationId',
                    workEntryId: '@workTimeEntryId'
                }, {
                    query: {
                        url: '/api/organizations/:organizationId/timeOffs?page=:page',
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
                            timeOffId: '@timeOffId'
                        },
                        isArray: false
                    },
                    create: {
                        url: '/api/organizations/:organizationId/timeOffs/new',
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
                            timeOffId: '@timeOffId'
                        },
                        isArray: false
                    }
                });
    }]);