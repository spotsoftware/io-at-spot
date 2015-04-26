'use strict';

angular.module('ioAtSpotApp').controller('JoinCtrl', function ($scope, Auth, $location, $window, invite, organization, $state, Invites) {
    $scope.errors = {};

    $scope.model = {
        user: {
            email: invite._user.email,
            name: invite._user.name
        },
        invite: invite,
        organization: organization,
        isNew: !invite._user.active,
        isAuthenticated: false
    }

    $scope.actions = {

        authenticate: function (form) {
            $scope.submitted = true;

            if (form.$valid) {

                Auth.signUp({
                    password: $scope.model.user.password,
                    email: $scope.model.user.email,
                    name: $scope.model.user.name
                }).$promise.then(
                    function () {
                        Invites.accept({
                            id: invite._id,
                            organizationId: organization._id
                        }, {}).$promise.then(
                            function (data) {
                                Auth.updateAuthModel();

                                $state.go('public.main');
                            },
                            function (err) {

                            });
                    },
                    function (err) {
                        err = err.data;
                        $scope.errors = {};

                        // Update validity of form fields that match the mongoose errors
                        angular.forEach(err.validation, function (error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.message;
                        });
                    });
            }
        }
    };

    $scope.loginOauth = function (provider) {
        $window.location.href = '/auth/' + provider;
    };

    if ($scope.model.isNew) {
        Auth.logout();
    } else {
        $state.go('public.login');
    }

});