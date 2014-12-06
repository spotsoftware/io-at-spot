'use strict';

angular.module('ioAtSpotApp')
    .controller('PrivateCtrl', function ($scope, Auth, authModel) {

        $scope.parent = {
            currentUser: authModel.currentUser,
            currentOrganization: authModel.currentOrganization,
            isCurrentOrganizationAdmin: function () {
                var organization = $scope.parent.currentOrganization;
                var currentUser = $scope.parent.currentUser;

                for (var i = 0; i < organization.members.length; i++) {
                    if (organization.members[i]._user._id === currentUser._id && organization.members[i].role === 'admin') {
                        return true;
                    }
                }
                return false;
            }
        };

        $scope.$on('organization-updated', function () {
            //console.log('updated org', authModel.currentOrganization);
            //Apparently useless, is necessary to trigger parent scope update in children.. uiRouter BUG?
            $scope.parent.currentOrganization = authModel.currentOrganization;
        });
    });