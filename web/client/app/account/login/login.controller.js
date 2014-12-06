'use strict';

angular.module('ioAtSpotApp')
    .controller('LoginCtrl', function ($scope, $state, Auth, $location, $window) {
        $scope.user = {};
        $scope.errors = {};

        $scope.login = function (form) {
            $scope.submitted = true;

            if (form.$valid) {
                Auth.login({
                    email: $scope.user.email,
                    password: $scope.user.password
                })
                    .then(function () {
                        // Logged in, redirect to home
                        $state.go('public.main');
                    })
                    .catch(function (err) {
                        $scope.errors.other = err.message;
                    });
            }
        };

        $scope.loginOauth = function (provider) {
            $window.location.href = '/auth/' + provider;
        };

    });