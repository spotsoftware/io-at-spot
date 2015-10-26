(function() {
'use strict';

	angular
		.module('io.doorkeeper')
		.controller('AppController', AppController);
	
	AppController.$inject = ['session', 'auth', '$state'];
	
	function AppController(session, auth, $state) {
		var vm = this;
		var originatorEv;
		
		vm.logout = function(){
			auth.logout();
			$state.go('app.login');
		};
		
		vm.openMenu = function($mdOpenMenu, ev) {
          originatorEv = ev;
          $mdOpenMenu(ev);
        };
		
		vm.isAuthenticated = auth.isAuthenticated;

		activate();

		////////////////

		function activate() { }
	}
})();