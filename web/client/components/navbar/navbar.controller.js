'use strict';

angular.module('ioAtSpotApp')
    .controller('NavbarCtrl', function ($scope, $state, $location, Auth, $modal, Organizations) {
        $scope.menu = [
            {
                'title': 'Work Time Entries',
                'link': '/WorkTimeEntries',
                'onlyAuth': true
            },
            {
                'title': 'Time Offs',
                'link': '/TimeOffs',
                'onlyAuth': true
            }
        ];

        $scope.isAdminOpened = false;
        $scope.isCollapsed = true;
        $scope.authModel = Auth.getAuthModel();

        $scope.isLoggedIn = Auth.isAuthenticated;

        $scope.logout = function () {
            Auth.logout();
            $state.go('public.login');
        };

        $scope.isActive = function (route) {
            return route === $location.path();
        };

        $scope.actions = {
            queryOrganizations: function () {
                return Organizations.query({}, {});
            }
        };

        $scope.selectOrganization = function () {

            //opens the modal
            var modalInstance = $modal.open({
                templateUrl: 'app/organizations/selectOrganization.modal.html',
                controller: 'SelectOrganizationModalCtrl',
                resolve: {
                    selectedOrganization: function () {
                        return $scope.currentOrganization;
                    },
                    organizations: function () {
                        return $scope.actions.queryOrganizations().$promise;
                    }
                }
            }).result.then(function (selectedOrganization) {
                Auth.setCurrentOrganization(selectedOrganization);

            }, function () {

            });
        };

    });