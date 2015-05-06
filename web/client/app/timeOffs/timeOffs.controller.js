'use strict';

angular.module('ioAtSpotApp')
    .controller('TimeOffsCtrl',
        function ($scope, $http, socket, authModel, TimeOffs, $moment, $modal, Members, messageCenterService) {

            //var authModel = Auth.getAuthModel();

            $scope.model = new function () {
                var model = this;

                model.timeOffs = [];
                model.totalNumber = null;
                model.page = 1;
                model.maxPaginationSize = 5;
                model.itemsPerPage = 10;

                model.showFilters = true;

                model.day = new Date();

                model.fastPeriodFilter = null;
                model.membersFilter = [authModel.currentUser._id];
                model.membersFilterText = authModel.currentUser.name;
                model.timeOffTypeFilter = 'All';
                model.from = null;
                model.to = null;

                //model.organization = Auth.getCurrentOrganization(organizations);
                model.workingDays = authModel.currentOrganization.settings.workingDays;
                model.timeOffTypes = authModel.currentOrganization.settings.timeOffTypes;

                $scope.$watch('model.fastPeriodFilter', function (newValue, oldValue) {

                    if (newValue === 'lm') {
                        $scope.actions.lastMonth();
                    } else if (newValue === 'tm') {
                        $scope.actions.thisMonth();
                    } else if (newValue === 'lw') {
                        $scope.actions.lastWeek();
                    } else if (newValue === 'tw') {
                        $scope.actions.thisWeek();
                    } else if (newValue === null) {
                        model.from = null;
                        model.to = null;
                        $scope.actions.search();
                    }

                });

                $scope.$watch('model.page', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        $scope.proxies.search.request();
                    }
                });

                $scope.$watch('model.timeOffTypeFilter', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        $scope.proxies.search.request();
                    }
                });

                $scope.$on('organization-updated', function (event, data) {
                    var newOrganization = data.newOrganization;
                    var oldOrganization = data.oldOrganization;

                    if (newOrganization !== oldOrganization) {

                        $scope.proxies.loadMembers();
                        $scope.proxies.search.request();
                    }
                });
            };

            $scope.utils = new function () {
                var utils = this;

                utils.userDropdownOpened = false;

                utils.format = 'dd MMMM yyyy';

                utils.disabled = function (date, mode) {
                    return false;
                };

                utils.datepickerOpened = false;
                utils.fromOpened = false;
                utils.toOpened = false;

                utils.isCurrentOrganizationAdmin = function () {

                    return authModel.currentOrganization.userRole === 'admin';
                };

                utils.setPageSize = function (n) {
                    $scope.model.itemsPerPage = n;
                    $scope.actions.search();
                };

                utils.getExportData = function () {
                    var data = [];
                    for (var i = 0; i < $scope.model.timeOffs.length; i++) {

                        data.push({
                            name: $scope.model.timeOffs[i]._user.name,
                            date: $moment($scope.model.timeOffs[i].performedAt).format('L'),
                            type: $scope.model.timeOffs[i].timeOffType,
                            amount: $scope.model.timeOffs[i].amount
                        });
                    }

                    return data;
                };

                utils.getExportHeader = function () {
                    return ['Name', 'Date', 'Type', 'Amount'];
                };

                utils.getExportFileName = function () {
                    return 'timeoffs.csv';
                };
            };


            $scope.actions = {

                memberFilterChange: function (user) {
                    if (user === 'all') {

                        $scope.model.membersFilter = [];
                        angular.forEach($scope.model.members, function (member) {
                            $scope.model.membersFilter.push(member._user._id);
                        });

                        $scope.model.membersFilterText = 'All';

                    } else {
                        $scope.model.membersFilterText = user.name;
                        $scope.model.membersFilter = [user._id];
                    }
                    $scope.utils.userDropdownOpened = false;
                    $scope.actions.search();
                },

                timeOffTypeChange: function (timeOffType) {
                    $scope.model.timeOffTypeFilter = timeOffType;
                    $scope.utils.dropdownOpened = false;
                },

                lastMonth: function () {
                    $scope.model.from = $moment().subtract('month', 1).startOf('month').toDate();
                    $scope.model.to = $moment().subtract('month', 1).endOf('month').toDate();

                    $scope.actions.search();
                },

                lastWeek: function () {
                    $scope.model.from = $moment().subtract('week', 1).startOf('week').toDate();
                    $scope.model.to = $moment().subtract('week', 1).endOf('week').toDate();

                    $scope.actions.search();
                },

                thisMonth: function () {
                    $scope.model.from = $moment().startOf('month').toDate();
                    $scope.model.to = $moment().endOf('month').toDate();

                    $scope.actions.search();
                },

                thisWeek: function () {
                    $scope.model.from = $moment().startOf('week').toDate();
                    $scope.model.to = $moment().endOf('week').toDate();

                    $scope.actions.search();
                },

                dateFromOpen: function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.utils.fromOpened = true;
                },

                dateToOpen: function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.utils.toOpened = true;
                },

                search: function () {
                    $scope.proxies.search.request();
                },

                edit: function (timeOff) {
                    //opens the modal
                    var modalInstance = $modal.open({
                        templateUrl: 'app/timeOffs/timeOffs.modal.html',
                        controller: 'TimeOffsModalCtrl',
                        resolve: {
                            currentUser: function () {
                                return authModel.currentUser;
                            },
                            timeOff: function () {
                                var to = {};
                                angular.copy(timeOff, to);
                                return to;
                            },
                            organizationSettings: function () {
                                return authModel.currentOrganization.settings
                            }
                        }
                    }).result.then(function (timeOff) {
                        //callback function
                        $scope.proxies.edit.request(timeOff);

                    }, function () {

                    });
                },

                delete: function (timeOff) {
                    $scope.proxies.delete.request(timeOff);
                },

                new: function () {
                    //opens the modal
                    var modalInstance = $modal.open({
                        templateUrl: 'app/timeOffs/timeOffs.modal.html',
                        controller: 'TimeOffsModalCtrl',
                        //size: 'lg',
                        resolve: {
                            currentUser: function () {
                                return authModel.currentUser;
                            },
                            timeOff: function () {
                                return null;
                            },
                            organizationSettings: function () {
                                return authModel.currentOrganization.settings
                            }
                        }
                    }).result.then(function (timeOff) {
                        //callback function
                        $scope.proxies.create.request(timeOff);

                    }, function () {

                    });
                }
            };

            $scope.proxies = new function () {
                var proxies = this;

                proxies.loadMembers = function () {
                    Members.query({
                        organizationId: authModel.currentOrganization._id
                    }).$promise.then(
                        function (members) {
                            $scope.model.members = members;
                        },
                        function (err) {
                            messageCenterService.add('danger', err.data.error, {
                                timeout: 3000
                            });
                        });
                };

                proxies.search = {
                    requestData: function () {

                        return {
                            from: $scope.model.from,
                            organizationId: authModel.currentOrganization._id,
                            page: $scope.model.page,
                            timeOffType: $scope.model.timeOffTypeFilter === 'All' ? null : $scope.model.timeOffTypeFilter,
                            to: $scope.model.to,
                            members: JSON.stringify($scope.model.membersFilter),
                            itemsPerPage: $scope.model.itemsPerPage
                        };
                    },
                    request: function () {
                        TimeOffs.query(proxies.search.requestData(), {}).$promise.then(
                            proxies.search.successCallback,
                            proxies.search.errorCallback);
                    },
                    successCallback: function (pagedResult) {
                        $scope.model.totalNumber = pagedResult.total;
                        $scope.model.timeOffs = pagedResult.items;
                        $scope.model.page = pagedResult.currentPage;
                    },
                    errorCallback: function (err) {
                        messageCenterService.add('danger', err.data.error, {
                            timeout: 3000
                        });
                    }
                };

                proxies.create = {
                    requestData: function (timeOff) {
                        return {
                            userId: authModel.currentUser._id,
                            timeOffType: timeOff.timeOffType,
                            amount: timeOff.amount,
                            performedAt: timeOff.performedAt
                        }
                    },
                    request: function (timeOff) {
                        TimeOffs.create({
                                organizationId: authModel.currentOrganization._id
                            },
                            proxies.create.requestData(timeOff)).$promise.then(
                            proxies.create.successCallback,
                            proxies.create.errorCallback);
                    },
                    successCallback: function () {
                        proxies.search.request();
                    },
                    errorCallback: function (err) {
                        messageCenterService.add('danger', err.data.error, {
                            timeout: 3000
                        });
                    }
                };

                proxies.edit = {
                    requestData: function (timeOff) {
                        return {
                            timeOffType: timeOff.timeOffType,
                            amount: timeOff.amount,
                            performedAt: timeOff.performedAt
                        }
                    },
                    request: function (timeOff) {

                        TimeOffs.update({
                                organizationId: authModel.currentOrganization._id,
                                timeOffId: timeOff._id
                            },
                            proxies.edit.requestData(timeOff)).$promise.then(
                            function () {
                                proxies.edit.successCallback(timeOff);
                            },
                            proxies.edit.errorCallback);
                    },
                    successCallback: function (timeOff) {

                        for (var i = 0; i < $scope.model.timeOffs.length; i++) {
                            if ($scope.model.timeOffs[i]._id === timeOff._id) {
                                $scope.model.timeOffs[i].timeOffType = timeOff.timeOffType;
                                $scope.model.timeOffs[i].amount = timeOff.amount;
                                $scope.model.timeOffs[i].performedAt = timeOff.performedAt;
                                break;
                            }
                        }

                    },
                    errorCallback: function (err) {
                        messageCenterService.add('danger', err.data.error, {
                            timeout: 3000
                        });
                    }
                };

                proxies.delete = {
                    requestData: function (timeOff) {

                    },
                    request: function (timeOff) {
                        TimeOffs.delete({
                                organizationId: authModel.currentOrganization._id,
                                timeOffId: timeOff._id
                            },
                            proxies.delete.requestData(timeOff)).$promise.then(
                            function () {
                                proxies.delete.successCallback(timeOff);
                            },
                            proxies.delete.errorCallback);
                    },
                    successCallback: function (timeOff) {
                        if ($scope.model.timeOffs.length === 1 && $scope.model.page > 1) {
                            $scope.model.page -= 1;
                        } else {
                            $scope.actions.search();
                        }
                    },
                    errorCallback: function (err) {
                        messageCenterService.add('danger', err.data.error, {
                            timeout: 3000
                        });
                    }
                };
            };

            $scope.proxies.search.request();
            $scope.proxies.loadMembers();
        });