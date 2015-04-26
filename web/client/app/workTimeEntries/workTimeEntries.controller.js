'use strict';

angular.module('ioAtSpotApp')
    .controller('WorkTimeEntriesCtrl',
        function ($scope, socket, WorkTimeEntries, $moment, $modal, authModel) {

            $scope.model = new function () {
                var model = this;

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

                $scope.$watch('parent.currentOrganization', function (newValue, oldValue) {
                    if (newValue != oldValue) {

                        console.log("org updated", authModel.currentOrganization._id);
                        socket.unsyncUpdates('workTimeEntry', oldValue._id);
                        socket.syncUpdates('workTimeEntry', newValue._id, function (event, item) {
                            if ($scope.utils.matchFilters(item)) {
                                //It's interesting!
                                console.log('interesting ', item);

                                $scope.proxies.search.request();
                            } else {
                                console.log('not interesting', item);
                            }
                        });

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
                }
            };


            $scope.actions = {

                memberFilterChange: function (user) {
                    if (user === 'all') {

                        $scope.model.membersFilter = [];
                        angular.forEach(authModel.currentOrganization.members, function (member) {
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