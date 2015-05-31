'use strict';

angular.module('ioAtSpotApp')
    .controller('PrivateCtrl', function ($scope, Auth) {

        /* $scope.parent = {
             currentUser: authModel.currentUser,
             currentOrganization: authModel.currentOrganization,
             isCurrentOrganizationAdmin: function () {
                 var organization = $scope.parent.currentOrganization;
                 var currentUser = $scope.parent.currentUser;

                 return organization.userRole === 'admin';
             }
         };

         $scope.$on('organization-updated', function () {
             //Apparently useless, is necessary to trigger parent scope update in children.. uiRouter BUG?
             $scope.parent.currentOrganization = authModel.currentOrganization;
         });*/
    });