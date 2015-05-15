'use strict';

angular.module('ioAtSpotApp')
    .controller('TimeOffsImportModalCtrl', ['$scope', '$modalInstance', '$timeout', '$moment', 'Utils', 'organizationSettings', 'currentUser',
        function ($scope, $modalInstance, $timeout, $moment, Utils, organizationSettings, currentUser) {

            $scope.model = new function () {
                var model = this;

                model.step = 0;
                model.fileName = '';
                model.rows = [];
                model.fields = [];
                model.contentPreview = '';
                model.separatorChar = ';';

                model.type = null;
                model.email = null;
                model.date = null;
                model.amount = null;
                model.externalId = null;
            };

            $scope.utils = new function () {
                var utils = this;

                utils.prevEnabled = function () {
                    return $scope.model.step > 0;
                };

                utils.nextEnabled = function () {
                    switch ($scope.model.step) {
                    case 0:
                        return $scope.model.rows.length > 0;
                    case 1:
                        return false;
                    case 2:
                        return false;
                    }
                };

                utils.emailDropdownOpened = true;

            };

            $scope.actions = new function () {
                var actions = this;

                actions.next = function () {
                    if ($scope.model.step === 0) {
                        actions.parseCSV();
                        $scope.model.step = 1;
                    } else if ($scope.model.step === 1) {

                    }
                };

                actions.prev = function () {
                    $scope.model.step--;

                };

                actions.readCompleted = function (fileName, fileContent) {
                    var rows = fileContent.replace(/\r/g, '').split('\n');
                    var preview = '';
                    for (var i = 0; i < rows.length && i < 5; i++) {
                        preview += rows[i] + '\n';
                    }
                    preview += '. . .';

                    $scope.model.contentPreview = preview;
                    $scope.model.rows = rows;
                    $scope.model.fileName = fileName;
                };

                actions.parseCSV = function () {
                    var rows = $scope.model.rows;
                    for (var i = 0; i < rows.length; i++) {
                        rows[i] = rows[i].split($scope.model.separatorChar);
                    }

                    $scope.model.fields = rows.shift();

                };

                actions.selectFile = function () {

                    $timeout(function () {
                        var elem = angular.element('#timeOffsFileInput');
                        elem.trigger('click');
                    }, 1);
                };

                actions.selectSeparator = function (sep) {
                    $scope.model.separatorChar = sep;
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

                actions.selectType = function (text) {
                    $scope.model.type = $scope.model.fields.indexOf(text);
                };
            };

        }
    ]);