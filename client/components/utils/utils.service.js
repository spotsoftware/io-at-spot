'use strict';

angular.module('ioAtSpotApp')
    .factory('Utils', function Utils($moment) {

        var today = new Date();

        return {

            /**
             * Validate timepicker
             *
             * @param  {Date} date - time to validate
             * @param  {Date} min - minimum allowed time
             * @return {Date} max - maximum allowed time
             */
            isTimeValid: function (time, min, max) {

                time.setDate(today.getDate());
                time.setMonth(today.getMonth());
                time.setFullYear(today.getFullYear());

                min.setDate(today.getDate());
                min.setMonth(today.getMonth());
                min.setFullYear(today.getFullYear());

                max.setDate(today.getDate());
                max.setMonth(today.getMonth());
                max.setFullYear(today.getFullYear());

                if (time >= min && time <= max) {
                    return true;
                } else {
                    return false
                }
            },

            today: function () {
                return today;
            }
        };
    });