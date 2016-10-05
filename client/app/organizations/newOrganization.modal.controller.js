'use strict';

angular.module('ioAtSpotApp')
    .controller('NewOrganizationModalCtrl', ['$scope', '$modalInstance',
        function ($scope, $modalInstance) {

            //Show user's organizations
            $scope.organization = {
                name: '',
                logo: ''
            };

            //Selects current organization
            $scope.save = function () {
                $modalInstance.close($scope.organization);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
    }]);