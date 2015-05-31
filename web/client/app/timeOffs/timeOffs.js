'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('private.timeOffs', {
                url: '/TimeOffs',
                templateUrl: 'app/timeOffs/timeOffs.html',
                controller: 'TimeOffsCtrl',
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.user],
                resolve: {
    authModel: ['Auth',
                    function (Auth) {
            return Auth.getAuthModel().$promise;
                    }]
}
            });
    });