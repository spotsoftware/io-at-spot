'use strict';

angular.module('ioAtSpotApp')
    .controller('MainCtrl', function ($scope, $http, socket, Auth) {

        $scope.model = {

            isLoggedIn: Auth.isAuthenticated

        };

    });