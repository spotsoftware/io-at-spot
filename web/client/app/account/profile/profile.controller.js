'use strict';

angular.module('ioAtSpotApp')
    .controller('ProfileCtrl', function ($scope, User, Auth) {
        $scope.errors = {};

        $scope.model = {
            user: $scope.parent.currentUser
        };

        $scope.changePassword = function (form) {
            $scope.submitted = true;
            if (form.$valid) {
                Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword)
                    .then(function () {
                        $scope.message = 'Password successfully changed.';
                    })
                    .catch(function (err) {
                        console.log(err);
                        form.password.$setValidity('mongoose', false);

                        $scope.errors.other = 'Incorrect password';
                        $scope.message = '';
                    });
            }
        };
    });