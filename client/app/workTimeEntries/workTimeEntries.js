'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('private.workTimeEntries', {
                url: '/WorkTimeEntries?userid&date',
                templateUrl: 'app/workTimeEntries/workTimeEntries.html',
                controller: 'WorkTimeEntriesCtrl',
                resolve: {
                    authModel: ['Auth',
                    function (Auth) {
                            return Auth.getAuthModel().$promise;
                    }]
                }
            });
    });
