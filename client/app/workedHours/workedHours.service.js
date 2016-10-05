'use strict';

angular.module('ioAtSpotApp').factory('WorkedHours', ['$resource',
        function ($resource) {
            return $resource(
                '/api/organizations/:organizationId/workedHours/', 
                {
                    organizationId: '@organizationId'
                }, {
                    query: {
                        url: '/api/organizations/:organizationId/workedHours?&from=:from&to=:to&members=:members',
                        method: 'GET',
                        params: {
                            members: '@members',
                            organizationId: '@organizationId',
                            to: '@to',
                        },
                        isArray: true 
                    },
                });
    }]);