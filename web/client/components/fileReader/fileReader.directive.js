angular.module('ioAtSpotApp')
    .directive("onReadFile", ["$parse",
            function ($parse) {
            return {
                restrict: "A",
                scope: false,
                link: function (scope, element, attrs) {

                    var fn = $parse(attrs.onReadFile);

                    element.on('change', function (onChangeEvent) {
                        var reader = new FileReader();
                        console.log(reader);

                        reader.onload = function (onLoadEvent) {
                            scope.$apply(function () {
                                fn(scope, {
                                    $imageDataUrl: onLoadEvent.target.result
                                });
                            });
                        };

                        reader.readAsDataURL((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                    });
                }
            };
        }]);