'use strict';

angular.module('ioAtSpotApp')
    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('public.login', {
                url: '/login',
                templateUrl: 'app/account/login/login.html',
                controller: 'LoginCtrl'
            })
            //            .state('public.signup', {
            //                url: '/signup',
            //                templateUrl: 'app/account/signup/signup.html',
            //                controller: 'SignupCtrl'
            //            })
            .state('public.join', {
                url: '/join/?organizationId&inviteId',
                templateUrl: 'app/account/join/join.html',
                controller: 'JoinCtrl',
                resolve: {
                    /*token: ['$stateParams',
                        function ($stateParams) {
                            return $stateParams.token;
                        }],*/
                    invite: ['$stateParams', 'Invites',
                        function ($stateParams, Invites) {
                            return Invites.detail({
                                organizationId: $stateParams.organizationId,
                                id: $stateParams.inviteId
                            }, {}).$promise;
                        }],
                    organization: ['$stateParams', 'Organizations',
                        function ($stateParams, Organizations) {

                            return Organizations.detail({
                                organizationId: $stateParams.organizationId
                            }, {}).$promise;
                        }],
                }
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
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.user],
                resolve: {
                    authModel: ['Auth',
                    function (Auth) {
                            return Auth.getAuthModel().$promise;
                    }]
                }
            });
    });