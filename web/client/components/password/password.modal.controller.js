'use strict';

angular.module('ioAtSpotApp')
    .controller('PasswordModalCtrl', ['$scope', '$modalInstance',

        function ($scope, $modalInstance) {
            $scope.submitted = false;
            $scope.errors = {};

            $scope.model = {
                password: '',
                confirmPassword: ''
            };

            $scope.save = function (form) {
                $scope.submitted = true;

                if (form.$valid) {

                    $modalInstance.close($scope.model.password);

                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
    }]);