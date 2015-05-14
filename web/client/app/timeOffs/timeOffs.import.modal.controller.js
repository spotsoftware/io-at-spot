'use strict';

angular.module('ioAtSpotApp')
    .controller('TimeOffsImportModalCtrl', ['$scope', '$modalInstance', '$timeout', '$moment', 'Utils', 'organizationSettings', 'currentUser',
        function ($scope, $modalInstance, $timeout, $moment, Utils, organizationSettings, currentUser) {

            $scope.csv = {
                content: null,
                header: true,
                separator: ',',
                result: null
            };

            $scope.model = new function () {
                var model = this;

                model.step = 0;
                model.rows = [];
                model.fields = [];

                model.email = null;
                model.date = null;
                model.amount = null;
                model.externalId = null;
            };

            $scope.utils = new function () {
                var utils = this;
            };

            $scope.actions = new function () {
                var actions = this;
                
                actions.next = function () {
                    $scope.model.step++;
                };
                
                actions.readCompleted = function (fileContent) {
                    var rows = fileContent.split('\n');

                    for (var i = 0; i < rows.length; i++) {
                        rows[i] = rows[i].replace(/\r/g, '').split(';');
                    }

                    $scope.model.fields = rows.shift();
                    $scope.model.rows = rows;


                    console.log($scope.model.fields);
                };

                actions.selectFile = function () {

                    $timeout(function () {
                        var elem = angular.element('#timeOffsFileInput');
                        elem.trigger('click');
                    }, 1);
                };

                actions.selectEmail = function (text) {
                    $scope.model.email = $scope.model.fields.indexOf(text);
                };

                actions.selectDate = function (text) {
                    $scope.model.date = $scope.model.fields.indexOf(text);
                };

                actions.selectAmount = function (text) {
                    $scope.model.amount = $scope.model.fields.indexOf(text);
                };

                actions.selectExternalId = function (text) {
                    $scope.model.externalId = $scope.model.fields.indexOf(text);
                };
            };

        }
    ]);