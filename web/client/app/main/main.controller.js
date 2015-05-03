'use strict';

angular.module('ioAtSpotApp')
    .controller('MainCtrl', function ($scope, $http, socket, Auth, Organizations, messageCenterService) {

        $scope.model = {

            // auth
            authModel: Auth.getAuthModel(),
            isLoggedIn: Auth.isAuthenticated
        };

        $scope.actions = {

            searchInvitations: function () {
                Organizations.query({}, {}).$promise.then(
                    function (data) {
                        if (data.invites && data.invites.length > 0) {
                            messageCenterService.add('danger', 'You have got some pending invite. Check your organizations info.');
                        }
                    },
                    function (err) {
                        messageCenterService.add('danger', err.data.error, {
                            timeout: 3000
                        });
                    });
            }
        }

        // let the page loading be faster
        $scope.$on('$viewContentLoaded', function () {
            if($scope.model.isLoggedIn()) {
                $scope.actions.searchInvitations();
            }
        });

    });