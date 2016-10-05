'use strict';

angular.module('ioAtSpotApp')
    .controller('ResetCtrl', function ($scope, Auth, $location, $window, messageCenterService, token) {
        $scope.user = {};
        $scope.errors = {};

        $scope.reset = function (form) {
            $scope.submitted = true;

            if (form.$valid) {

                Auth.reset({
                    password: $scope.user.password,
                    token: token
                }).then(function (data) {

                    messageCenterService.add('success', data.message, {
                        timeout: 3000,
                        callback: function () {
                            // Account created, redirect to home
                            $location.path('/login');
                        }
                    });
                }).catch(function (err) {
                    messageCenterService.add('danger', err.message, {
                        timeout: 3000,
                        callback: function () {
                            // Account created, redirect to home
                            $location.path('/reset');
                        }
                    });
                });
            }
        };

    });