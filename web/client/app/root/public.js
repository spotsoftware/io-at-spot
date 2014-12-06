'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider.state('public', {
            abstract: true,
            data: {

            },
            templateUrl: 'app/app.html'
        })
    });