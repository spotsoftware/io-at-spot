(function () {
	'use strict';

	angular.module('io.doorkeeper', [
		'ngMaterial',
		'ngCookies',
		'LocalStorageModule',
		'ui.router'
	]);

    angular.module('io.doorkeeper').constant('CONFIG', {
        ioUrl: 'http://io-demo.dokku.demo.spot.it/',
    });

	angular.module('io.doorkeeper').config(moduleConfig).run(moduleRun);

	moduleConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

	function moduleConfig($stateProvider, $urlRouterProvider, $locationProvider) {

		//$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('app', {
				abstract: true,
				controller: 'AppController',
				controllerAs: 'vm',
				templateUrl: 'scripts/app.html'
			})
			.state('app.login', {
				url: '/login',
				controller: 'LoginController',
				controllerAs: 'vm',
				templateUrl: 'scripts/login/login.html'
			})
			.state('app.main', {
				url: '/',
				controller: 'MainController',
				controllerAs: 'vm',
				templateUrl: 'scripts/main/main.html',
				data: {
					auth: true
				},
				resolve: {
				 	authenticationResolution: authenticationResolution
				}
			});

		$locationProvider.html5Mode(true);
	}
	
	moduleRun.$inject = ['$rootScope', 'auth', '$state'];
	function moduleRun($rootScope, auth, $state) {
        $rootScope.$on('$stateChangeStart', function (event, next) {
            if (next.data && next.data.auth && !auth.isAuthPending()) {
                if (!auth.isAuthenticated()) {			
                    event.preventDefault();
					$state.go('app.login');
                }
            }
        });
	}

	authenticationResolution.$inject = ['auth', '$state'];
    function authenticationResolution(auth, $state) {
        return auth.resolveAuthentication().then(function () {
        }, function (err) {
            $state.go('app.login');
        });
    }
})();