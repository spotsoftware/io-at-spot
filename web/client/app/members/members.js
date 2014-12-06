'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('private.organizations.members', {
                url: '/Organizations',
                templateUrl: 'app/members/members.html',
                controller: 'MembersCtrl',
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
            });
    });