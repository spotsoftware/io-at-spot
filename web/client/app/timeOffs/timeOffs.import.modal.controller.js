'use strict';

angular.module('ioAtSpotApp')
    .controller('TimeOffsImportModalCtrl', ['$scope', '$modalInstance', '$timeout', '$moment', 'currentOrganization', 'currentUser', 'TimeOffs', 'messageCenterService',
        function ($scope, $modalInstance, $timeout, $moment, currentOrganization, currentUser, TimeOffs, messageCenterService) {

            $scope.model = new function () {
                var model = this;

                model.step = 0;
                model.fileName = '';
                model.rows = [];
                model.data = [];
                model.fields = [];
                model.contentPreview = '';
                model.separatorChar = ';';
                model.importPromise = null;

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
                    }
                };

                utils.importEnabled = function () {
                    return $scope.model.step === 1 &&
                        $scope.model.externalId !== null &&
                        $scope.model.email !== null &&
                        $scope.model.date !== null &&
                        $scope.model.amount !== null &&
                        $scope.model.type !== null;
                };
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
                    var data = [];

                    for (var i = 0; i < rows.length; i++) {
                        rows[i].replace(/\n/g, '');
                        if (rows[i] !== '') {
                            data.push(rows[i].split($scope.model.separatorChar));
                        }
                    }

                    $scope.model.fields = data.shift();
                    $scope.model.data = data;
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

                actions.startImport = function () {
                    var externalId,
                        email,
                        date,
                        amount,
                        type,
                        valid = true,
                        itemsToPost = [];

                    var err = {
                        ex: null,
                        msg: '',
                        index: -1
                    };

                    for (var i = 0; i < $scope.model.data.length && valid; i++) {
                        externalId = $scope.model.data[i][$scope.model.externalId];
                        email = $scope.model.data[i][$scope.model.email];
                        date = $scope.model.data[i][$scope.model.date];
                        amount = $scope.model.data[i][$scope.model.amount];
                        type = $scope.model.data[i][$scope.model.type];

                        //Begin validation
                        if (!email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
                            err.msg += 'invalid email ' + email;
                            err.ex = 'invalid mail';
                            valid = false;
                        } else {
                            try {

                                amount = parseFloat(amount.replace(',', '.'));
                                date = new Date(date);

                                var item = {
                                    externalId: externalId,
                                    email: email,
                                    date: date,
                                    amount: amount,
                                    type: type
                                }

                                itemsToPost.push(item);

                            } catch (e) {
                                valid = false;

                                err.ex = e;
                                err.msg += 'invalid parsing \n';
                                err.index = i;
                            }
                        }
                    }

                    if (valid) {
                        $scope.model.importPromise = TimeOffs.batch({
                            organizationId: currentOrganization._id
                        }, {
                            items: itemsToPost
                        }).$promise;

                        $scope.model.importPromise.then(function () {
                            $modalInstance.close();
                        }, function (err) {
                            $modalInstance.dismiss(err);
                        });

                    } else {
                        messageCenterService.add('danger', err.msg, {
                            timeout: 3000
                        });
                        console.log('data preparing error', err);
                    }
                };
            };

        }
    ]);