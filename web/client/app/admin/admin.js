'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('private.admin', {
                url: '/admin',
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl',
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
            });
    });