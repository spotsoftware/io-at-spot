'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('private.workedHours', {
                url: '/WorkedHours',
                templateUrl: 'app/workedHours/workedHours.html',
                controller: 'WorkedHoursCtrl',
                resolve: {
                    authModel: ['Auth',
                    function (Auth) {
                            return Auth.getAuthModel().$promise;
                    }]
                }
            });
    });