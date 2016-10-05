'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('public.main', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            });
    });