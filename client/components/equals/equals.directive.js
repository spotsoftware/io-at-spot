var equalsModule = angular.module('equals', []);
equalsModule.directive('equals', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            equals: '='
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function () {
                var modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
                return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.equals === modelValue;
            }, function (currentValue) {
                ctrl.$setValidity('equals', currentValue);
            });
        }
    };
});