'use strict';

angular.module('ioAtSpotApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'btford.socket-io',
    'ui.router',
    'ui.bootstrap',
    'angular-momentjs',
    'xeditable',
    'duScroll',
    'messageCenter',
    'equals',
    'chart.js',
    'ngCsv',
    'cgBusy'
])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $urlRouterProvider
            .otherwise('/');

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
    })

.factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('token')) {
                config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function (response) {
            if (response.status === 401) {
                $location.path('/login');
                // remove any stale tokens
                $cookieStore.remove('token');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
})

.run(function ($rootScope, $location, Auth, editableOptions, AUTH_EVENTS, $moment, $state) {
    // Redirect to login if route requires auth and you're not logged in

    $moment.locale('it');

    $rootScope.$on('$stateChangeStart', function (event, next) {

        var authorizedRoles = next.data.authorizedRoles;
        if (authorizedRoles && !Auth.getAuthModel().currentUser._id && (!Auth.getAuthModel().$promise || Auth.getAuthModel().$promise.resolved)) {

            event.preventDefault();
            $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            $state.go("public.login");
        }
    });

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeSuccess', function (event, next) {

        var authorizedRoles = next.data.authorizedRoles;

        if (authorizedRoles) {
            Auth.isAuthorized(authorizedRoles, function (result) {

                if (!result) {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    console.log('unauthorizad', authorizedRoles);
                    $state.go("public.login");
                }
            });
        }
    });

    editableOptions.theme = 'bs3';
});
