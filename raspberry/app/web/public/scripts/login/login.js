(function() {
'use strict';

	angular
		.module('io.doorkeeper')
		.controller('LoginController', LoginController);
	
	LoginController.$inject = ['auth', '$mdToast', '$state']
	function LoginController(auth, $mdToast, $state) {
		var vm = this;
		
		vm.email = '';
		vm.password = '';
		
		vm.login = function(form){
			if(form.$valid){
				auth.login({
					email: vm.email,
					password: vm.password
				}).then(function(result){
					$state.go('app.main');
				}).catch(function(reason){				
					$mdToast.show({
						template: '<md-toast class="md-toast error">' + reason.data.message + '</md-toast>',
						hideDelay: 2000,
						position: 'bottom center'
					});
				});
			}
		}

		activate();

		////////////////

		function activate() { }
	}
})();