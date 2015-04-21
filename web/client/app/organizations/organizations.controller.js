'use strict';

angular.module('ioAtSpotApp')
    .controller('OrganizationsCtrl',
        function ($scope, $http, socket, Users, Members, Organizations, Auth, $modal, $document, messageCenterService) {

            $scope.model = new function () {
                var model = this;

                model.organizations = [];
                model.searchText = '';
                model.newTimeOffType = '';
            };

            $scope.actions = {

                search: function () {
                    Organizations.query({}, {}).$promise.then(
                        function (organizations) {
                            $scope.model.organizations = organizations;
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },

                addTimeOffType: function (org) {
                    org.settings.timeOffTypes.push($scope.model.newTimeOffType);
                    $scope.model.newTimeOffType = '';
                    $scope.actions.updateOrganization(org);
                },

                deleteTimeOffType: function (org, timeOffType) {
                    org.settings.timeOffTypes.splice(org.settings.timeOffTypes.indexOf(timeOffType), 1);
                    $scope.model.newTimeOffType = '';
                    $scope.actions.updateOrganization(org);
                },

                workingDayTimeChanged: function () {
                    clearInterval($scope.timeChangedInterval);
                    $scope.timeChangedInterval = setTimeout(function () {
                        $scope.actions.updateOrganization(org);
                    }, 1000);
                },

                new: function () {
                    //opens the modal
                    var modalInstance = $modal.open({
                        templateUrl: 'app/organizations/newOrganization.modal.html',
                        controller: 'NewOrganizationModalCtrl',
                        resolve: {

                        }
                    }).result.then(function (organization) {
                        Organizations.create({

                        }, {
                            name: organization.name,
                            logo: organization.logo,
                            members: organization.members
                        }).$promise.then(function (organization) {
                            $scope.model.organizations.push(organization);
                            setTimeout(function () {
                                var orgElement = document.getElementById(organization._id);
                                $document.scrollToElementAnimated(angular.element(orgElement));
                            }, 100);
                        });

                    });
                },

                updateOrganization: function (organization) {
                    Organizations.update({
                        organizationId: organization._id
                    }, {
                        name: organization.name,
                        logo: organization.logo,
                        settings: organization.settings
                    }).$promise.then(function () {
                            if ($scope.parent.currentOrganization._id === organization._id) {
                                Auth.setCurrentOrganization(organization);
                            }
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },

                deleteOrganization: function (organization) {
                    Organizations.delete({
                        organizationId: organization._id
                    }, {}).$promise.then(function () {
                            $scope.actions.search();
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                },

                imageChanged: function ($imageDataUrl, organization) {
                    organization.imageDataUrl = $imageDataUrl;
                },

                changeImage: function ($event) {
                    //PORCHERIA!
                    setTimeout(function () {
                        angular.element($event.target).parents().children().first().trigger('click');
                    }, 100);
                },

                setupOrganizationPassword: function (organization) {
                    //opens the modal
                    var modalInstance = $modal.open({
                        templateUrl: 'components/password/password.modal.html',
                        controller: 'PasswordModalCtrl',
                        resolve: {
                            organization: function () {
                                return organization;
                            }
                        }
                    }).result.then(function (newPassword) {
                        Organizations.update({
                            organizationId: organization._id
                        }, {
                            password: newPassword
                        }).$promise.then(function (data) {
                            organization.hasPassword = true;
                            messageCenterService.add('success', data.message, {
                                timeout: 3000
                            });
                        }).catch(function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                    });
                }
            };

            $scope.utils = {
                isMemberCurrentUser: function (member) {
                    return member._user._id === $scope.parent.currentUser._id;
                },
                currentUserIsAdmin: function (organization) {
                    for (var i = 0; i < organization.members.length; i++) {
                        if (organization.members[i]._user._id === $scope.parent.currentUser._id && organization.members[i].role === 'admin') {
                            return true;
                        }
                    }
                    return false;
                },
                readingUid: false
            };

            $scope.proxies = new function () {
                var proxies = this;

                proxies.create = {
                    requestData: function (organization) {
                        return {

                        }
                    },
                    request: function (organization) {
                        Organization.create({

                            },
                            proxies.create.requestData(organization)).$promise.then(
                            function (organization) {
                                proxies.create.successCallback(organization);
                            },
                            function (err) {
                                messageCenterService.add('danger', err.data.error, {
                                    timeout: 3000
                                });
                            });
                    },
                    successCallback: function () {
                        proxies.search.request();
                    },
                    errorCallback: function (error) {
                        console.log(error);
                    }
                };
            };

            $scope.actions.search();

        });