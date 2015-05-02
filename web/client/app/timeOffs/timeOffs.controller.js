'use strict';

angular.module('ioAtSpotApp')
    .controller('TimeOffsCtrl',
        function ($scope, $http, socket, Auth, TimeOffs, $moment, $modal, messageCenterService) {


            $scope.model = new function () {
                var model = this;

                model.timeOffs = [];
                model.totalNumber = null;
                model.page = 1;
                model.maxPaginationSize = 5;
                model.itemsPerPage = 10;

                model.day = new Date();

                model.fastPeriodFilter = null;
                model.membersFilter = [$scope.parent.currentUser._id];
                model.membersFilterText = $scope.parent.currentUser.name;
                model.timeOffTypeFilter = 'All';
                model.from = null;
                model.to = null;

                //model.organization = Auth.getCurrentOrganization(organizations);
                model.workingDays = $scope.parent.currentOrganization.settings.workingDays;
                model.timeOffTypes = $scope.parent.currentOrganization.settings.timeOffTypes;

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

            };


            $scope.actions = {

                memberFilterChange: function (user) {
                    if (user === 'all') {

                        $scope.model.membersFilter = [];
                        angular.forEach($scope.parent.currentOrganization.members, function (member) {
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
                    $scope.model.from = $moment().subtract('month', 1).startOf('month');
                    $scope.model.to = $moment().subtract('month', 1).endOf('month');

                    $scope.actions.search();
                },

                lastWeek: function () {
                    $scope.model.from = $moment().subtract('week', 1).startOf('week');
                    $scope.model.to = $moment().subtract('week', 1).endOf('week');

                    $scope.actions.search();
                },

                thisMonth: function () {
                    $scope.model.from = $moment().startOf('month');
                    $scope.model.to = $moment().endOf('month');

                    $scope.actions.search();
                },

                thisWeek: function () {
                    $scope.model.from = $moment().startOf('week');
                    $scope.model.to = $moment().endOf('week');

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
                            timeOff: function () {
                                var to = {};
                                angular.copy(timeOff, to);
                                return to;
                            },
                            organizationSettings: function () {
                                return $scope.parent.currentOrganization.settings
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
                        resolve: {
                            timeOff: function () {
                                return null;
                            },
                            organizationSettings: function () {
                                return $scope.parent.currentOrganization.settings
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

                proxies.search = {
                    requestData: function () {

                        return {
                            from: $scope.model.from,
                            organizationId: $scope.parent.currentOrganization._id,
                            page: $scope.model.page,
                            timeOffType: $scope.model.timeOffTypeFilter === 'All' ? null : $scope.model.timeOffTypeFilter,
                            to: $scope.model.to
                        };
                    },
                    request: function () {
                        TimeOffs.query(proxies.search.requestData(), {}).$promise.then(
                            function (pagedResult) {
                                proxies.search.successCallback(pagedResult);
                            },
                            function (err) {
                                proxies.search.errorCallback(err);
                            });
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
                            userId: $scope.parent.currentUser._id,
                            timeOffType: timeOff.timeOffType,
                            amount: timeOff.amount,
                            performedAt: timeOff.performedAt
                        }
                    },
                    request: function (timeOff) {
                        TimeOffs.create({
                                organizationId: $scope.parent.currentOrganization._id
                            },
                            proxies.create.requestData(timeOff)).$promise.then(
                            function () {
                                proxies.create.successCallback();
                            },
                            function (err) {
                                proxies.search.errorCallback(err);
                            });
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
                        console.log('edit', timeOff);
                        TimeOffs.update({
                                organizationId: $scope.parent.currentOrganization._id,
                                timeOffId: timeOff._id
                            },
                            proxies.edit.requestData(timeOff)).$promise.then(
                            function (timeOff) {
                                proxies.edit.successCallback(timeOff);
                            },
                            function (err) {
                                proxies.edit.errorCallback(err);
                            });
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
                                organizationId: $scope.parent.currentOrganization._id,
                                timeOffId: timeOff._id
                            },
                            proxies.delete.requestData(timeOff)).$promise.then(
                            function () {
                                proxies.delete.successCallback(timeOff);
                            },
                            function (err) {
                                proxies.delete.errorCallback(err);
                            });
                    },
                    successCallback: function (timeOff) {

                        //                        for (var i = 0; i < $scope.model.timeOffs.length; i++) {
                        //                            if ($scope.model.timeOffs[i]._id === timeOff._id) {
                        //                                $scope.model.timeOffs.splice(i, 1);
                        //                                break;
                        //                            }
                        //                        }

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

        });