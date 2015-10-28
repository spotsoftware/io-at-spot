(function() {
	'use strict';

	angular
		.module('io.doorkeeper')
		.controller('MainController', MainController);

	MainController.$inject = ['$http', '$mdToast', 'session', 'auth', '$state', '$scope'];

	function MainController($http, $mdToast, session, auth, $state, $scope) {
		var vm = this;

		vm.name = session.name.toUpperCase();

		vm.action = function(mark, open) {
			$scope.$parent.vm.loading = true;
			
			$http.post('action', {
				open: open,
				mark: mark,
				tokenHash: session.tokenHash
			}).then(function(result) {
				$scope.$parent.vm.loading = false;
				vm.showToast('success', result.data);
			}).catch(function(reason) {
				$scope.$parent.vm.loading = false;
				vm.showToast('error', reason.data);
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