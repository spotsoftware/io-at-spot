var path = require('path');

module.exports = function (app, passport, listener) {

	// route for login form
	// route for processing the login form
	// route for signup form
	// route for processing the signup form

	// route for showing the profile page
	app.post('/action', function (req, res) {		
        
        var re = /^192\.168\.100\.(1([0-1][0-9]|20))$/;
        if((re.exec(req.ip)) !== null){
        	res.send(403);
        }else {
        	
        	var accessType = 0;
        	
        	if(req.body.open && req.body.mark){
        		accessType = 0;
        	}else if(req.body.open){
        		accessType = 1;
        	}else if(req.body.mark){
        		accessType = 2;
        	}
        	
        	listener.onTokenHashSubmitted(req.body.tokenHash, accessType, function (response) {
				res.status(response.responseCode).send(response.message);
		    });
        }
        
	});

    app.get('/error', function (req, res) {
        res.send(403);
    });

	// =====================================
	// GOOGLE ROUTES =======================
	// =====================================
	// send to google to do the authentication
	// profile gets us their basic information including their name
	// email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
		passport.authenticate('google', {
			//successRedirect: '/',
			failureRedirect: '/error',
			session: false
		}),
		function(req, res){
			res.cookie('google_token', req.google_token);
    		res.redirect('/');
		});

	// application -------------------------------------------------------------
	app.get('*', function (req, res) {
		res.sendfile(path.join(__dirname, './public/index.html')); // load the single view file (angular will handle the page changes on the front-end)
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/error');
}