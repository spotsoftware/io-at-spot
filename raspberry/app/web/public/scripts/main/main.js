(function() {
	'use strict';

	angular
		.module('io.doorkeeper')
		.controller('MainController', MainController);

	MainController.$inject = ['$http', '$mdToast', 'session', 'auth', '$state'];

	function MainController($http, $mdToast, session, auth, $state) {
		var vm = this;

		vm.name = session.name.toUpperCase();

		vm.action = function(mark, open) {
			$http.post('action', {
				open: open,
				mark: mark,
				tokenHash: session.tokenHash
			}).then(function(result) {
				vm.showToast('success', 'success');
			}).catch(function(reason) {
				vm.showToast('error', 'error');
			});
		};

		vm.logout = function() {
			auth.logout();
			$state.go('app.login');
		};

		vm.showToast = function(type, content) {
			$mdToast.show({
				template: '<md-toast class="md-toast ' + type + '">' + content + '</md-toast>',
				hideDelay: 2000,
				position: 'bottom center'
			});
		}

		activate();

		////////////////

		function activate() {}
	}
})();