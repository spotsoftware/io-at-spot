'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('private.organizations', {
                url: '/Organizations',
                templateUrl: 'app/organizations/organizations.html',
                controller: 'OrganizationsCtrl',
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
            });
    });