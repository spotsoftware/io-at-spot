'use strict';

angular.module('ioAtSpotApp')
    .factory('Auth', function ($location, $rootScope, $http, User, Organizations, $cookieStore, $q) {
        var authService = {};

        var authModel = new function () {
            var model = this;
            model.currentUser = {};
            model.currentOrganization = {};
            model.$promise = null;
        };

        if ($cookieStore.get('token')) {
            console.log('starting auth service, there is a token');
            authModel.$promise = populateModel();
        };

        function getCurrentOrganization(organizations) {

            for (var i = 0; i < organizations.length; i++) {
                if (authModel.currentUser._lastOrganization === organizations[i]._id) {
                    return organizations[i];
                }
            }
            return organizations[0];
        }

        function populateModel() {
            var deferred = $q.defer();

            User.get().$promise.then(function (user) {
                authModel.currentUser = user;

                Organizations.query().$promise.then(function (organizations) {

                    authModel.currentOrganization = getCurrentOrganization(organizations.organizations);
                    //console.log('balblbalbla', authModel.currentOrganization);
                    deferred.resolve(authModel);

                }, function (err) {
                    console.log('rejecting deferred');
                    deferred.reject(err);
                });
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

        /**
         * Authenticate user and save token
         *
         * @param  {Object}   user     - login info
         * @param  {Function} callback - optional
         * @return {Promise}
         */
        authService.login = function (user, callback) {
            var cb = callback || angular.noop;
            var deferred = $q.defer();

            $http.post('/auth/local', {
                email: user.email,
                password: user.password
            }).
            success(function (data) {
                $cookieStore.put('token', data.token);

                authModel.$promise = populateModel();
                authModel.$promise.then(function () {
                    console.log('populate model deferred resolved');
                    deferred.resolve(data);
                    return cb();
                }, function (err) {
                    this.logout();
                    deferred.reject(err);
                });
            }).error(function (err) {
                this.logout();
                deferred.reject(err);
                return cb(err);
            }.bind(this));

            return deferred.promise;
        };

        /**
         * User forgot password initial step
         *
         * @param  {Object}   user     - login info
         * @param  {Function} callback - optional
         * @return {Promise}
         */
        authService.forgot = function (user, callback) {
            var cb = callback || angular.noop;
            var deferred = $q.defer();

            $http.post('/auth/local/forgot', {
                email: user.email
            }).success(function (data) {
                console.log(data.message);
                deferred.resolve(data);
                return cb();
            }).error(function (err) {
                deferred.reject(err);
                return cb(err);
            }.bind(this));

            return deferred.promise;
        };

        /**
         * User forgot password final step
         *
         * @param  {Object}   user - login info
         * @param  {Function} callback - optional
         * @return {Promise}
         */
        authService.reset = function (user, callback) {
            var cb = callback || angular.noop;
            var deferred = $q.defer();

            $http.post('/auth/local/reset', {
                password: user.password,
                token: user.token
            }).success(function (data) {
                deferred.resolve(data);
                return cb();
            }).error(function (err) {
                deferred.reject(err);
                return cb(err);
            }.bind(this));

            return deferred.promise;
        };

        /**
         * Delete access token and user info
         *
         * @param  {Function}
         */
        authService.logout = function () {
            $cookieStore.remove('token');
            authModel.currentUser = {};
            authModel.currentOrganization = {};
            authModel.$promise = null;
        };



        authService.isAuthenticated = function () {
            return !!(authModel.currentUser._id);
        };


        authService.signUp = function (data) {
            return User.create(data, function (data) {
                $cookieStore.put('token', data.token);
            });
        };

        /**
         * Create a new user
         *
         * @param  {Object}   user     - user info
         * @param  {Function} callback - optional
         * @return {Promise}
         */
        authService.createUser = function (user, callback) {
            var cb = callback || angular.noop;
            var deferred = $q.defer();

            User.save(user,
                function (data) {
                    $cookieStore.put('token', data.token);
                    authModel.$promise = populateModel();
                    authModel.$promise.then(function () {
                        console.log('populate model deferred resolved');
                        deferred.resolve(data);
                        return cb();
                    }, function (err) {
                        this.logout();
                        deferred.reject(err);
                    });
                },
                function (err) {
                    this.logout();
                    return cb(err);
                }.bind(this)).$promise;

            return deferred.promise;
        };

        /**
         * Change password
         *
         * @param  {String}   oldPassword
         * @param  {String}   newPassword
         * @param  {Function} callback    - optional
         * @return {Promise}
         */
        authService.changePassword = function (oldPassword, newPassword, callback) {
            var cb = callback || angular.noop;

            return User.update({
                //id: currentUser._id
            }, {
                oldPassword: oldPassword,
                newPassword: newPassword
            }, function (user) {
                return cb(user);
            }, function (err) {
                return cb(err);
            }).$promise;
        };

        /**
         * Gets all available info on authenticated user
         *
         * @return {Object} user
         */
        //        authService.getCurrentUser = function () {
        //            return authModel.currentUser;
        //        };

        /**
         * Gets currently selected organization
         *
         * @return {Object} organization
         */
        //        authService.getCurrentOrganization = function () {
        //            return authModel.currentOrganization;
        //        };

        authService.getAuthModel = function () {
            return authModel;
        };

        authService.updateAuthModel = function () {
            authModel.$promise = populateModel();
        };


        /**
         * Sets selected organization
         *
         * @param  {Objectid} organizationId
         */
        authService.setCurrentOrganization = function (organization) {
            if (authService.isAuthenticated()) {

                authModel.currentUser._lastOrganization = organization._id;
                authModel.currentOrganization = organization;

                User.update({}, {
                    _lastOrganization: organization._id
                });

                $rootScope.$broadcast('organization-updated');
            }
        };


        /**
         * Waits for currentUser to resolve before checking if user is logged in
         */
        authService.isAuthenticatedAsync = function (cb) {
            if (authModel.$promise) {
                authModel.$promise.then(function () {
                    cb(true);
                }).catch(function () {
                    cb(false);
                });
            } else if (authService.isAuthenticated()) {
                cb(true);
            } else {
                cb(false);
            }
        };

        authService.isAuthorized = function (authorizedRoles) {

            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }

            console.log(authModel.currentUser.role);

            return (authService.isAuthenticated() &&
                authorizedRoles.indexOf(authModel.currentUser.role) !== -1);
        };

        /**
         * Get auth token
         */
        authService.getToken = function () {
            return $cookieStore.get('token');
        };


        return authService;
    });