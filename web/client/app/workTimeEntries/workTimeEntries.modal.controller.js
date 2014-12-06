'use strict';

angular.module('ioAtSpotApp')
    .controller('WorkTimeEntriesModalCtrl', ['$scope', '$modalInstance', '$moment', 'Utils', 'workTimeEntry', 'organizationSettings',
        function ($scope, $modalInstance, $moment, Utils, workTimeEntry, organizationSettings) {

            $scope.model = new function () {
                var model = this;

                model.isNew = workTimeEntry === null;

                if (workTimeEntry) {
                    model.workTimeEntry = workTimeEntry;
                } else {

                    var performedAt = $moment();

                    while (organizationSettings.workingDays[performedAt.day()].active === false) {
                        performedAt.subtract(1, 'days');
                    }

                    model.workTimeEntry = {
                        performedAt: performedAt.toDate(),
                        workTimeEntryType: 'in',
                        manual: true
                    };
                }

                $scope.$watch('model.workTimeEntry.performedAt', function (newValue, oldValue) {
                    if (newValue != oldValue) {

                        if (!Utils.isTimeValid(newValue,
                            new Date(organizationSettings.workingDays[newValue.getDay()].startOfficeTime),
                            new Date(organizationSettings.workingDays[newValue.getDay()].endOfficeTime))) {

                            model.workTimeEntry.performedAt = oldValue;
                        }
                    }
                });
            };

            $scope.dateUtils = new function () {
                var utils = this;

                utils.disabled = function (date, mode) {
                    return organizationSettings.workingDays[date.getDay()].active === false;
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