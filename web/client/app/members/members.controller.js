'use strict';

angular.module('ioAtSpotApp')
    .controller('MembersCtrl',
        function ($scope, $http, socket, Users, Members, Organizations, $modal, $document, messageCenterService) {

            console.log('ciao', $scope);
            $scope.model = new function () {
                var model = this;

                model.addingMember = false;
                //model.organization = null;
                model.selectedUser = null;
                model.editingMember = null;
                model.newTimeOffType = '';
            };

            $scope.actions = {

                userSelected: function ($item, $model, $label) {
                    $scope.model.selectedUser = $item;
                    $scope.model.selectedUser.role = 'user';
                },

                toggleAddingMember: function () {
                    angular.forEach($scope.model.organization.members, function (mem) {
                        $scope.actions.cancelEditMember(mem);
                    });
                    $scope.model.selectedUser = null;
                    $scope.model.addingMember = !$scope.model.addingMember;
                },

                addMember: function () {

                    Members.add({
                        organizationId: $scope.model.organization._id,
                    }, {
                        userId: $scope.model.selectedUser._id,
                        role: $scope.model.selectedUser.role,
                        nfc_uid: $scope.model.selectedUser.nfc_uid
                    }).$promise.then(
                        function (member) {
                            $scope.actions.toggleAddingMember();
                            $scope.actions.reloadMembers();
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },

                editMember: function (member) {
                    angular.forEach($scope.model.organizations, function (org) {
                        angular.forEach(org.members, function (mem) {
                            $scope.actions.cancelEditMember(mem);
                        });
                    });

                    $scope.model.editingMember = JSON.parse(JSON.stringify(member));
                    //member.editing = true;
                },

                readUid: function (member) {
                    $scope.utils.readingUid = true;

                    Organizations.readUid({
                        organizationId: $scope.model.organization._id
                    }).$promise.then(function (data) {
                        member.nfc_uid = data.uid;
                        $scope.utils.readingUid = false;
                    }, function (err) {
                        messageCenterService.add('danger', err.data.error, {
                            timeout: 3000
                        });
                        $scope.utils.readingUid = false;
                    });
                },

                cancelEditMember: function (member) {
                    $scope.model.editingMember = null;
                    //member.editing = false;
                },

                removeMember: function (member) {

                    Members.remove({
                        organizationId: $scope.model.organization._id,
                        id: member._id
                    }, {}).$promise.then(
                        function () {
                            $scope.actions.reloadMembers();
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },

                updateMember: function (member) {

                    Members.update({
                        organizationId: $scope.model.organization._id,
                        id: member._id
                    }, {
                        role: $scope.model.editingMember.role,
                        nfc_uid: $scope.model.editingMember.nfc_uid
                    }).$promise.then(
                        function () {
                            $scope.model.editingMember = null;
                            $scope.actions.reloadMembers();
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },

                reloadMembers: function () {
                    Members.query({
                        organizationId: $scope.model.organization._id,
                    }, {}).$promise.then(function (members) {
                            $scope.model.organization.members = members;
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                }
            };

            $scope.utils = {
                isMemberCurrentUser: function (member) {
                    return member._user._id === $scope.parent.currentUser._id;
                },
                currentUserIsAdmin: function () {
                    for (var i = 0; i < $scope.model.organization.members.length; i++) {
                        if ($scope.model.organization.members[i]._user._id === $scope.parent.currentUser._id && $scope.model.organization.members[i].role === 'admin') {
                            return true;
                        }
                    }
                    return false;
                },
                readingUid: false
            };

            $scope.proxies = {
                searchUsers: {
                    requestData: function (searchText, searchField) {
                        var excluded = [];
                        angular.forEach($scope.model.organization.members, function (member) {
                            excluded.push(member._user._id);
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

        });