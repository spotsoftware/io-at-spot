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
                        url: '/api/organizations/:organizationId/timeOffs?page=:page&from=:from&to=:to&timeOffType=:timeOffType',
                        method: 'GET',
                        params: {
                            from: '@from',
                            members: '@members',
                            organizationId: '@organizationId',
                            page: '@page',
                            timeOffType: '@timeOffType',
                            to: '@to',
                            itemsPerPage: '@itemsPerPage'
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
                        url: '/api/organizations/:organizationId/timeOffs',
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
                    },
                    batch: {
                        url: '/api/organizations/:organizationId/timeOffs/batch',
                        method: 'POST',
                        params: {
                            organizationId: '@organizationId'
                        },
                        isArray: false
                    }
                });
    }]);
