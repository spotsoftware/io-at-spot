'use strict';

angular.module('ioAtSpotApp')
    .controller('WorkTimeEntriesCtrl',
        function ($scope, socket, WorkTimeEntries, $moment, $modal, authModel, Members) {

            $scope.model = new function () {
                var model = this;

                //Chart
                model.chartLabels = [];
                model.chartSeries = ['in', 'out', 'in', 'out'];
                model.chartData = [[],
                                   [],
                                   [],
                                   []];

                model.chartOptions = {
                    datasetFill: false,
                    scaleOverride: true,
                    scaleShowVerticalLines: false,
                    scaleSteps: 5,
                    scaleStepWidth: 180,
                    scaleStartValue: 180,
                    scaleLabel: function (point) {

                        return $scope.utils.getTimeFromEndDayDiff(point.value);
                    },
                    customTooltips: false,
                    multiTooltipTemplate: function (point) {
                        return point.datasetLabel + ': ' + $scope.utils.getTimeFromEndDayDiff(point.value);
                    }
                };

                model.workTimeEntries = [];
                model.totalNumber = null;
                model.page = 1;
                model.maxPaginationSize = 5;
                model.itemsPerPage = 10;

                model.fastPeriodFilter = null;
                model.membersFilter = [authModel.currentUser._id];
                model.membersFilterText = authModel.currentUser.name;
                model.workTimeEntryType = null;
                model.from = null;
                model.to = null;

                $scope.$watch('model.fastPeriodFilter', function (newValue, oldValue) {
                    if (newValue != oldValue) {
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
                    }
                });

                $scope.$watch('model.page', function (newValue, oldValue) {
                    if (newValue != oldValue) {

                        $scope.proxies.search.request();
                    }
                });

                $scope.$watch('model.workTimeEntryType', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        $scope.proxies.search.request();
                    }
                });

                $scope.$on('organization-updated', function (event, data) {
                    var newOrganization = data.newOrganization;
                    var oldOrganization = data.oldOrganization;

                    if (newOrganization !== oldOrganization) {
                        socket.unsyncUpdates('workTimeEntry', oldOrganization._id);
                        socket.syncUpdates('workTimeEntry', newOrganization._id, function (event, item) {
                            if ($scope.utils.matchFilters(item)) {
                                //It's interesting!
                                console.log('interesting ', item);

                                $scope.proxies.search.request();
                            } else {
                                console.log('not interesting', item);
                            }
                        });

                        $scope.proxies.loadMembers();
                        $scope.proxies.search.request();
                    }
                });

            };

            $scope.utils = new function () {
                var utils = this;

                utils.userDropdownOpened = false;

                utils.matchFilters = function (workTimeEntry) {
                    if ($scope.model.membersFilter.indexOf(workTimeEntry._user) === -1) {
                        return false;
                    }

                    if (workTimeEntry.performedAt < $scope.model.from) {
                        return false;
                    }

                    if (workTimeEntry.performedAt > $scope.model.to) {
                        return false;
                    }

                    if ($scope.model.workTimeEntryType !== null && $scope.model.workTimeEntryType !== workTimeEntry.workTimeEntryType) {
                        return false;
                    }

                    return true;
                };

                utils.format = 'dd MMMM yyyy';

                utils.disabled = function (date, mode) {
                    return false; //(mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
                };

                utils.fromOpened = false;
                utils.toOpened = false;

                utils.isCurrentOrganizationAdmin = function () {

                    return authModel.currentOrganization.userRole === 'admin';
                };

                utils.getTimeFromEndDayDiff = function (diff) {
                    var minutes = ((60 * 24) - (diff)) / 60;

                    var sign = minutes < 0 ? "-" : "";
                    var min = Math.floor(Math.abs(minutes))
                    var sec = Math.floor((Math.abs(minutes) * 60) % 60);
                    return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
                };

                utils.setupChart = function () {
                    var days = [],
                        data = [[],
                                [],
                                [],
                                []];

                    var wte = null,
                        day = null,
                        dayIndex = null,
                        serieIndex = null;

                    day = $moment($scope.model.workTimeEntries[$scope.model.workTimeEntries.length - 1].performedAt).startOf('day');
                    var endDay = $moment($scope.model.workTimeEntries[0].performedAt).endOf('day');

                    do {
                        days.push(day.format('L'));
                        for (var i = 0; i < $scope.model.chartSeries.length; i++) {
                            data[i].push(null);
                        }
                    } while (day.add(1, 'days').isBefore(endDay));

                    for (var i = 0; i < $scope.model.workTimeEntries.length; i++) {
                        wte = $scope.model.workTimeEntries[i];

                        dayIndex = days.indexOf($moment(wte.performedAt).format('L'));

                        if (wte.workTimeEntryType === 'in') {
                            serieIndex = data[0][dayIndex] === null ? 0 : 2;
                        } else {
                            serieIndex = data[1][dayIndex] === null ? 1 : 3;
                        }

                        data[serieIndex][dayIndex] = $moment(wte.performedAt).endOf('day').diff($moment(wte.performedAt), 'minutes');
                    }

                    console.log(days, data);

                    $scope.model.chartLabels = days;
                    $scope.model.chartData = data;
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

                    $scope.utils.fromOpened = !$scope.utils.fromOpened;
                    $scope.utils.toOpened = false;
                },

                dateToOpen: function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.utils.toOpened = !$scope.utils.toOpened;
                    $scope.utils.fromOpened = false;
                },

                search: function () {
                    $scope.proxies.search.request();
                },

                edit: function (workTimeEntry) {
                    //opens the modal
                    var modalInstance = $modal.open({
                        templateUrl: 'app/workTimeEntries/workTimeEntries.modal.html',
                        controller: 'WorkTimeEntriesModalCtrl',
                        resolve: {
                            workTimeEntry: function () {
                                var wte = {};
                                angular.copy(workTimeEntry, wte);
                                return wte;
                            },
                            organizationSettings: function () {
                                return authModel.currentOrganization.settings
                            }
                        }
                    }).result.then(function (workTimeEntry) {
                        //callback function
                        $scope.proxies.edit.request(workTimeEntry);

                    }, function () {

                    });
                },

                delete: function (workTimeEntry) {
                    $scope.proxies.delete.request(workTimeEntry);
                },

                new: function () {
                    //opens the modal
                    var modalInstance = $modal.open({
                        templateUrl: 'app/workTimeEntries/workTimeEntries.modal.html',
                        controller: 'WorkTimeEntriesModalCtrl',
                        resolve: {
                            workTimeEntry: function () {
                                return null;
                            },
                            organizationSettings: function () {
                                return authModel.currentOrganization.settings
                            }
                        }
                    }).result.then(function (workTimeEntry) {
                        //callback function
                        $scope.proxies.create.request(workTimeEntry);

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
                            console.log(err);
                        });
                };

                proxies.search = {
                    requestData: function () {

                        console.log($scope.model.membersFilter);

                        return {
                            organizationId: authModel.currentOrganization._id,
                            page: $scope.model.page,
                            from: $scope.model.from,
                            to: $scope.model.to,
                            type: $scope.model.workTimeEntryType,
                            members: JSON.stringify($scope.model.membersFilter)
                        };
                    },
                    request: function () {
                        WorkTimeEntries.query(proxies.search.requestData(), {}).$promise.then(
                            function (pagedResult) {
                                proxies.search.successCallback(pagedResult);
                            },
                            function (err) {
                                proxies.search.errorCallback(err);
                            });
                    },
                    successCallback: function (pagedResult) {

                        $scope.model.totalNumber = pagedResult.total;
                        $scope.model.workTimeEntries = pagedResult.items;
                        $scope.model.page = pagedResult.currentPage;

                        $scope.utils.setupChart();
                    },
                    errorCallback: function (error) {
                        console.log(error);
                    }
                };

                proxies.create = {
                    requestData: function (workTimeEntry) {
                        return {
                            userId: authModel.currentUser._id,
                            workTimeEntryType: workTimeEntry.workTimeEntryType,
                            manual: workTimeEntry.manual,
                            performedAt: workTimeEntry.performedAt
                        }
                    },
                    request: function (workTimeEntry) {
                        WorkTimeEntries.create({
                                organizationId: authModel.currentOrganization._id
                            },
                            proxies.create.requestData(workTimeEntry)).$promise.then(
                            function (pagedResult) {
                                proxies.create.successCallback();
                            },
                            function (err) {
                                proxies.search.errorCallback(err);
                            });
                    },
                    successCallback: function () {
                        proxies.search.request();
                    },
                    errorCallback: function (error) {
                        console.log(error);
                    }
                };

                proxies.edit = {
                    requestData: function (workTimeEntry) {
                        return {
                            workTimeEntryType: workTimeEntry.workTimeEntryType,
                            manual: workTimeEntry.manual,
                            performedAt: workTimeEntry.performedAt
                        }
                    },
                    request: function (workTimeEntry) {
                        WorkTimeEntries.update({
                                organizationId: authModel.currentOrganization._id,
                                workTimeEntryId: workTimeEntry._id
                            },
                            proxies.edit.requestData(workTimeEntry)).$promise.then(
                            function (workTimeEntry) {
                                proxies.edit.successCallback(workTimeEntry);
                            },
                            function (err) {
                                proxies.edit.errorCallback(err);
                            });
                    },
                    successCallback: function (workTimeEntry) {

                        for (var i = 0; i < $scope.model.workTimeEntries.length; i++) {
                            if ($scope.model.workTimeEntries[i]._id === workTimeEntry._id) {
                                $scope.model.workTimeEntries[i].workTimeEntryType = workTimeEntry.workTimeEntryType;
                                $scope.model.workTimeEntries[i].manual = workTimeEntry.manual;
                                $scope.model.workTimeEntries[i].performedAt = workTimeEntry.performedAt;
                                break;
                            }
                        }

                    },
                    errorCallback: function (error) {
                        console.log(error);
                    }
                };

                proxies.delete = {
                    requestData: function (workTimeEntry) {

                    },
                    request: function (workTimeEntry) {
                        WorkTimeEntries.delete({
                                organizationId: authModel.currentOrganization._id,
                                workTimeEntryId: workTimeEntry._id
                            },
                            proxies.delete.requestData(workTimeEntry)).$promise.then(
                            function () {
                                proxies.delete.successCallback(workTimeEntry);
                            },
                            function (err) {
                                proxies.delete.errorCallback(err);
                            });
                    },
                    successCallback: function (workTimeEntry) {

                        if ($scope.model.workTimeEntries.length === 1 && $scope.model.page > 1) {
                            $scope.model.page -= 1
                        } else {
                            $scope.actions.search();
                        }

                    },
                    errorCallback: function (error) {
                        console.log(error);
                    }
                };
            };

            $scope.proxies.search.request();
            $scope.proxies.loadMembers();

            socket.syncUpdates('workTimeEntry', authModel.currentOrganization._id, function (event, item) {
                if ($scope.utils.matchFilters(item)) {
                    //It's interesting!
                    console.log('interesting ', item);

                    $scope.proxies.search.request();
                } else {
                    console.log('not interesting', item);
                }
            });

            $scope.$on('$destroy', function () {
                socket.unsyncUpdates('workTimeEntry', authModel.currentOrganization._id);
            });

        });