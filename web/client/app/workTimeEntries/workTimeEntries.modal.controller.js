'use strict';

angular.module('ioAtSpotApp')
    .controller('WorkTimeEntriesModalCtrl', ['$scope', '$modalInstance', '$moment', 'Utils', 'workTimeEntry', 'organizationSettings', 'currentUser',
        function ($scope, $modalInstance, $moment, Utils, workTimeEntry, organizationSettings, currentUser) {

            $scope.model = new function () {
                var model = this;

                model.isNew = workTimeEntry === null;

                model.memberName = function () {
                    if (model.isNew) {
                        return currentUser.name;
                    } else {
                        return workTimeEntry._user.name;
                    }
                }

                if (workTimeEntry) {
                    model.workTimeEntry = workTimeEntry;
                } else {

                    var performedAt = $moment();

                    while (organizationSettings.workingDays[performedAt.day()].active === false) {
                        performedAt.subtract(1, 'days');
                    }

                    model.workTimeEntry = {
                        performedAt: performedAt.toDate(),
                        workTimeEntryType: 'in'
                    };
                }

                $scope.$watch('model.workTimeEntry.performedAt', function (newValue, oldValue) {
                    if (!newValue) {
                        model.workTimeEntry.performedAt = oldValue;
                    }
                });

                model.datepickerOptions = {
                    startingDay: 1
                };
            };

            $scope.dateUtils = new function () {
                var utils = this;

                utils.disabled = function (date, mode) {
                    var day = date.getDay();

                    return organizationSettings.workingDays[day - 1 < 0 ? 6 : day - 1].active === false;
                };

                utils.opened = false;

                utils.today = new Date();

                utils.timeChanged = function () {

                };
            };

            $scope.actions = new function () {
                var actions = this;

                actions.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                actions.dateOpen = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.dateUtils.opened = true;
                };

                actions.save = function () {
                    workTimeEntry = workTimeEntry || {}
                    angular.extend(workTimeEntry, $scope.model.workTimeEntry);

                    $modalInstance.close(workTimeEntry);
                };

            };

    }]);