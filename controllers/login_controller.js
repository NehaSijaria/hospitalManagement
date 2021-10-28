const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./db_controller.js');
const bodyParser = require('body-parser');
const validator = require('./validators.js');
const bcrypt = require('bcrypt');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function (app) {

	app.get('/login', function (req, res) {
	
		res.render('login.ejs', { error: null });
	});

	passport.use(new LocalStrategy(
		function (username, password, done) {
			User.getUserById(username, function (err, user) {
				if (!user.length) {
					console.log("u r hear" + username);
					return done(null, false, { message: 'Invalid Credentials! Please try again.' });
				}
				else {
			
					console.log("+password" + password);
          console.log("pwd.user0" + user[0].password);
          console.log(password == user[0].password);
					if (password == user[0].password) {
						
              User.getUserType(username, function (err, res1) {
                return done(null, res1[0]);
              });
					} else {
						console.log("else evalu")
              return done(null, false, {
                message: "Invalid Credentials! Please try again.",
              });
            }
					//});
				}




			});
		}));

	passport.serializeUser(function (user, done) {
		done(null, user.username);
	});

	passport.deserializeUser(function (username, done) {
		User.getUserById(username, function (err, user) {
			done(err, user);
		});
	});

	app.post('/login', urlencodedParser, function (req, res) {
		passport.authenticate('local', function (err, user, info) {
			console.log(user);
			if (err) throw err;
			if (!user) {
				return res.render('login.ejs', { error: info });
			}
			else {
				req.login(user, function (err) {
					if (err) throw err;
					if (user.type == 'Manager') {
						res.redirect('/manager');
					}
					else if (user.type == 'Maintenance') {
						res.redirect('/mstaff');
					}
					else if (user.type == 'Receptionist') {
						res.redirect('/receptionist');
					}
					else if (user.type == 'Nurse') {
						res.redirect('/nurse');
					}
					else if (user.type == 'Doctor') {
						res.redirect('/doctor');
					}
				});
			}
		})(req, res);

	});
	

	app.post('/reset', urlencodedParser, function (req, res) {
		const { userid } = req.body;
		validator.resetPassword(userid);
	});

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/login');
	});

};