'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('public.login', {
                url: '/login',
                templateUrl: 'app/account/login/login.html',
                controller: 'LoginCtrl'
            })
            .state('public.signup', {
                url: '/signup',
                templateUrl: 'app/account/signup/signup.html',
                controller: 'SignupCtrl'
            })
            .state('public.forgot', {
                url: '/forgot',
                templateUrl: 'app/account/forgot/forgot.html',
                controller: 'ForgotCtrl'
            })
            .state('public.reset', {
                url: '/reset/:token',
                templateUrl: 'app/account/reset/reset.html',
                controller: 'ResetCtrl',
                resolve: {
                    token: ['$stateParams',
                        function ($stateParams) {
                            return $stateParams.token;
                        }]
                }
            })
            .state('private.profile', {
                url: '/profile',
                templateUrl: 'app/account/profile/profile.html',
                controller: 'ProfileCtrl',
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
            });
    });