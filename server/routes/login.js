'use strict';

let express = require('express');
let auth = require('../middleware/auth');
const chalk = require('chalk');
let loginRouter = express.Router();


let loginTriesLimit = 0;


loginRouter.get('/', (req, res) => {
	console.log(chalk.green('GET ' + chalk.blue('/login')));
	res.render('login.ejs');
});


loginRouter.post('/', (req, res) => {
	console.log(chalk.cyan('POST ' + chalk.blue('/login')));
	// demo purposes
	if (loginTriesLimit == 3) {
		loginTriesLimit = 0;
		// redirecting to the home page
		res.json({
			success: true
		});
		return;
	}
	auth.authorize(req.body, (err, result) => {
		if (err) {
			loginTriesLimit++;
			res.json({
				success: false
			});
		} else {
			res.cookie('ngotok', result, {
				httpOnly: true
			});
			res.json({
				success: true,
				token: result
			});
		}
	});
});

module.exports = loginRouter;