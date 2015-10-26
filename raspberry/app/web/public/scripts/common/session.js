(function () {
    'use strict';

    angular.module('io.doorkeeper')
        .factory('session', session);

    function session() {
        var sessionService = {
            create: create,
            destroy: destroy
        };

        return sessionService;

        ////////////////

        function create(id, name, email, token, tokenHash) {
            sessionService.id = id;
            sessionService.name = name;
            sessionService.email = email;
            sessionService.token = token;
            sessionService.tokenHash = tokenHash;
        };

        function destroy() {
            sessionService.id = null;
            sessionService.name = null;
            sessionService.email = null;
            sessionService.token = null;
            sessionService.tokenHash = null;
        };
    }
})();