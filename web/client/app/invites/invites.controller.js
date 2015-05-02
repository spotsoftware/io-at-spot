'use strict';

angular.module('ioAtSpotApp')
    .controller('InvitesCtrl',
        function ($scope, $http, socket, Users, Invites, Organizations, $modal, $document, messageCenterService, Auth) {

            $scope.model = new function () {
                var model = this;
                model.addingInvite = false;
                model.organization = null;
                model.selectedUser = null;
                model.newTimeOffType = '';
                model.invites = [];
            };

            $scope.actions = {

                userSelected: function ($item, $model, $label) {
                    $scope.model.selectedUser = $item;
                    $scope.model.selectedUser.role = 'user';
                },

                toggleAddingInvite: function () {
                    $scope.model.selectedUser = null;
                    $scope.model.addingInvite = !$scope.model.addingInvite;
                },

                addInvite: function () {

                    Invites.add({
                        organizationId: $scope.model.organization._id,
                    }, {
                        userId: $scope.model.selectedUser._id,
                        email: $scope.model.selectedUser
                    }).$promise.then(
                        function (invite) {
                            $scope.actions.toggleAddingInvite();
                            $scope.actions.loadInvites();
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },

                refreshInvite: function (invite) {
                    Invites.add({
                        organizationId: $scope.model.organization._id,
                    }, {
                        userId: invite._user._id
                    }).$promise.then(
                        function (invite) {},
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },
                removeInvite: function (invite) {

                    Invites.remove({
                        organizationId: $scope.model.organization._id,
                        id: invite._id
                    }, {}).$promise.then(
                        function () {
                            $scope.actions.loadInvites();
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },
                loadInvites: function () {
                    Invites.query({
                        organizationId: $scope.model.organization._id,
                    }, {}).$promise.then(function (invites) {
                            $scope.model.invites = invites;
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                }
            };

            $scope.utils = {
                currentUserIsAdmin: function () {
                    return $scope.model.organization.userRole === 'admin';
                },
                isUserSelected: function () {
                    if ($scope.model.selectedUser === null) {
                        return false;
                    } else if (typeof $scope.model.selectedUser == 'string') {
                        return false;
                    } else {
                        return true;
                    }
                },
                isEmailValid: function () {
                    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                    return re.test($scope.model.selectedUser);
                },
                readingUid: false
            };

            $scope.proxies = {
                searchUsers: {
                    requestData: function (searchText, searchField) {
                        var excluded = [];
                        angular.forEach($scope.model.invites, function (invite) {
                            excluded.push(invite._user._id);
                        });

                        return {
                            excluded: excluded,
                            searchText: searchText,
                            searchField: searchField
                        }
                    },
                    request: function (searchText, searchField) {
                        return Users.query($scope.proxies.searchUsers.requestData(searchText, searchField), {}).$promise.then(
                            function (data) {
                                return $scope.proxies.searchUsers.successCallback(data);
                            });
                    },
                    successCallback: function (users) {
                        return users;
                    }
                }
            };

            $scope.$watch('model.organization', function (value) {
                $scope.actions.loadInvites();
            });
            //

        });