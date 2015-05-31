'use strict';

angular.module('ioAtSpotApp')
    .controller('MembersCtrl',
        function ($scope, $http, socket, Members, Organizations, $modal, $document, messageCenterService, Auth) {
            $scope.model = new function () {
                var model = this;

                model.addingMember = false;
                model.organization = null;
                model.editingMember = null;
                model.newTimeOffType = '';
            };

            $scope.actions = {

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
                },

                removeMember: function (member) {

                    Members.remove({
                        organizationId: $scope.model.organization._id,
                        id: member._id
                    }, {}).$promise.then(
                        function () {
                            $scope.actions.loadMembers();
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
                            $scope.actions.loadMembers();
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },

                loadMembers: function () {
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
                    return member._user._id === Auth.getAuthModel().currentUser._id;
                },
                currentUserIsAdmin: function () {
                    return $scope.model.organization.userRole === 'admin';
                },
                readingUid: false
            };

            $scope.$watch('model.organization', function (value) {
                $scope.actions.loadMembers();
            });
        });
