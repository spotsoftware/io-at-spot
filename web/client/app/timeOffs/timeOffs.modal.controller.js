'use strict';

angular.module('ioAtSpotApp')
    .controller('TimeOffsModalCtrl', ['$scope', '$modalInstance', '$moment', 'Utils', 'timeOff', 'organizationSettings', 'currentUser',
        function ($scope, $modalInstance, $moment, Utils, timeOff, organizationSettings, currentUser) {

            $scope.model = new function () {
                var model = this;

                model.isNew = timeOff === null;

                model.memberName = function () {
                    if (model.isNew) {
                        return currentUser.name;
                    } else {
                        return workTimeEntry._user.name;
                    }
                }

                if (timeOff) {
                    model.timeOff = timeOff;
                } else {

                    var performedAt = $moment();

                    while (organizationSettings.workingDays[performedAt.day()].active === false) {
                        performedAt.subtract(1, 'days');
                    }

                    model.timeOff = {
                        performedAt: performedAt.toDate(),
                        timeOffType: 'ferie',
                        amount: organizationSettings.defaultTimeOffAmount
                    };
                }

                model.timeOffTypes = organizationSettings.timeOffTypes;

                model.datepickerOptions = {
                    startingDay: 1
                };
            };

            $scope.utils = new function () {
                var utils = this;

                utils.disabled = function (date, mode) {
                    var day = date.getDay();

                    return organizationSettings.workingDays[day - 1 < 0 ? 6 : day - 1].active === false;
                };

                utils.datepickerOpened = false;

                utils.dropdownOpened = false;

                utils.today = new Date();

                utils.timeChanged = function () {

                };
            };

            $scope.actions = new function () {
                var actions = this;

                actions.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                actions.save = function () {
                    //                    var timeOff = timeOff || {}
                    //                    angular.extend(timeOff, $scope.model.timeOff);
                    $modalInstance.close($scope.model.timeOff);
                };

                actions.dateOpen = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.utils.datepickerOpened = true;
                };

                actions.timeOffTypeChange = function (timeOffType) {
                    $scope.model.timeOff.timeOffType = timeOffType;
                    $scope.utils.dropdownOpened = false;
                }

            };

        }
    ]);