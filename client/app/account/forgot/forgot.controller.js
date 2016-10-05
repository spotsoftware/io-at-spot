'use strict';

angular.module('ioAtSpotApp')
    .controller('ForgotCtrl', function ($scope, Auth, $location, $window, messageCenterService) {
        $scope.user = {};
        $scope.errors = {};

        $scope.forgot = function (form) {
            $scope.submitted = true;

            if (form.$valid) {

                Auth.forgot({
                    email: $scope.user.email
                }).then(function () {

                    messageCenterService.add('success',
                        'An email with instructions has been sent to your email address.', {
                            timeout: 3000,
                            callback: function () {
                                // Account created, redirect to home
                                $location.path('/');
                            }
                        });
                }).catch(function (err) {
                    messageCenterService.add('danger', err.message, {
                        timeout: 3000
                    });
                });
            }
        };

    });