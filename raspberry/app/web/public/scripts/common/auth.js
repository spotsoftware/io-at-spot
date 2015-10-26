(function () {
    'use strict';

    angular
        .module('io.doorkeeper')
        .factory('auth', AuthService);

    AuthService.$inject = ['$http', '$q', 'localStorageService', '$timeout', '$rootScope', 'CONFIG', 'session', '$cookies'];

    function AuthService($http, $q, localStorageService, $timeout, $rootScope, CONFIG, session, $cookies) {
        var authService = {},
            $authDeferred = null;

        function init() {

            var authData = localStorageService.get('authorizationData');
            var google_token = $cookies['google_token'];
            
            if (authData) {
                authService.refresh();
            } else if (google_token){
                authService.getLocalUser(google_token);                
            };
        }

        authService.resolveAuthentication = function () {

            if (!$authDeferred) {
                init();
            }
            return $authDeferred.promise;
        };


        authService.login = function (data) {

            var deferred = $q.defer();

            $http.post(CONFIG.ioUrl + 'auth/local', data)
                .then(function (res) {

                    localStorageService.set('authorizationData', {
                        token: res.data.token
                    });
                    
                    return authService.refresh();

                }).then(function(res){
                    deferred.resolve(res);
                }).catch(function(reason){
                    deferred.reject(reason);
                });

            return deferred.promise;
        };

        authService.refresh = function () {

            $authDeferred = $q.defer();

            var authData = localStorageService.get('authorizationData');
            if (authData) {

                localStorageService.remove('authorizationData');

                $http.post(CONFIG.ioUrl + 'auth/local/refresh', {
                    token: authData.token
                }).then(function (res) {

                    localStorageService.set('authorizationData', {
                        token: res.data.token
                    });
                    
                    session.create(res.data.user._id, res.data.user.name, res.data.user.email, res.data.token, res.data.tokenHash);

                    $authDeferred.resolve(res);

                }).catch(function (reason) {
                    $authDeferred.reject(reason);
                    authService.logout();
                });

            } else {
                $authDeferred.reject('Cannot refresh token: no auth data found in client.');
            }

            return $authDeferred.promise;
        };

        authService.getLocalUser = function (google_token) {

            $authDeferred = $q.defer();

            $http.post(CONFIG.ioUrl + 'auth/google/getLocalUser', {
                token: google_token
            }).then(function (res) {

                localStorageService.set('authorizationData', {
                    token: res.data.token
                });

                session.create(res.data.user._id, res.data.user.name, res.data.user.email, res.data.token, res.data.tokenHash);

                $authDeferred.resolve(res);

            }).catch(function (reason) {
                $authDeferred.reject(reason);
                authService.logout();
            });

            return $authDeferred.promise;
        };

        authService.logout = function () {
            localStorageService.remove('authorizationData');
            session.destroy();
            $authDeferred = null;
        };

        authService.isAuthPending = function () {
            return !!$authDeferred;
        };

        authService.isAuthenticated = function () {
            return !!session.id;
        };

        init();
        
        return authService;
    }
})();