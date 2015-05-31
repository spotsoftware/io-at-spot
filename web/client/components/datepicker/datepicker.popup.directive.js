'use strict';

/**
 * This directive fixes the formatting problem of angular-ui Bootstrap datepicker.
 */
angular.module('ioAtSpotApp').directive('datepickerPopup', function () {
    return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function (scope, element, attr, controller) {
            //remove the default formatter from the input directive to prevent conflict
            controller.$formatters.shift();
        }
    }
});