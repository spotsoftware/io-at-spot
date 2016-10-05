'use strict';

angular.module('ioAtSpotApp')
    .controller('SelectOrganizationModalCtrl', ['$scope', '$modalInstance', 'organizations', 'selectedOrganization',
        function ($scope, $modalInstance, organizations, selectedOrganization) {

            //Show user's organizations
            $scope.organizations = organizations.organizations;

            //Selects current organization
            $scope.select = function (organization) {
                $modalInstance.close(organization);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
    }]);