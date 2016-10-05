'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('private', {
                abstract: true,
                templateUrl: 'app/app.html',
                //controller: 'PrivateCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
                }
            });
    });