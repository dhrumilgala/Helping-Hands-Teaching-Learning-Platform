'use strict';

let express = require('express');
let auth = require('../middleware/auth');
let managementRouter = express.Router();
let Management = require('../models/management');
let Schedule = require('../models/schedule');
const chalk = require('chalk');
let Donations = require('../models/donations');
let Student = require('../models/student');

// authentication middleware
managementRouter.use((req, res, next) => {
	auth.authenticate(req, res, next, 'management');
});

managementRouter.get('/', (req, res) => {
	console.log(chalk.green('GET ' + chalk.blue('/management')));
	res.render('managementHome.ejs', {
		user: req.user
	});
});

managementRouter.get('/details', (req, res) => {
	console.log(chalk.green('GET ' + chalk.blue('/management/details')));
	Management.findOne({
		username: req.user.username
	}, (err, management) => {
		if (err) throw err;
		if (management == null) return res.json({
			success: false
		});
		res.json({
			success: true,
			name: management.name,
			email: management.email,
			username: management.username
		});
	});
});

managementRouter.get('/users/:usertype', (req, res) => {
	console.log(chalk.green('GET ' + chalk.blue('/management/users')));
	if (req.params.usertype == 'management') return res.json({
		success: false
	});
	let Usertype = require('../models/' + req.params.usertype);
	Usertype.find().exec((err, results) => {
		let users = [];
		for (let i = 0; i < results.length; i++) {
			users.push({
				name: results[i].name,
				username: results[i].username,
				email: results[i].email
			});
		}
		res.json({
			success: true,
			users: users
		});
	});
});


managementRouter.post('/addUser/:usertype', (req, res) => {
	console.log(chalk.cyan('POST ' + chalk.blue('/management/addUser')));
	if (req.params.usertype != "student" && req.params.usertype != "teacher") return res.json({
		success: false
	});
	let Usertype = require('../models/' + req.params.usertype);
	let user = new Usertype({
		name: req.body.name,
		email: req.body.email,
		username: req.body.username,
		password: req.body.password
	});
	if (req.params.usertype == 'teacher' && req.body.students) {
		// req.body.students contain all the usernames
		Student.find({
			username: {
				$in: req.body.students
			}
		}, (err, students) => {
			if (err) throw err;
			user.students = students
			user.save((err, result) => {
				if (err) return res.json({
					success: false,
					errorMsg: err.toString()
				});
				console.log(chalk.yellow('Added ' + req.params.usertype + ': ' + result.username));
				res.json({
					success: true
				});
			});
		});
	} else {
		user.save((err, result) => {
			if (err) return res.json({
				success: false,
				errorMsg: err.toString()
			});
			console.log(chalk.yellow('Added ' + req.params.usertype + ': ' + result.username));
			res.json({
				success: true
			});
		});
	}
});

managementRouter.post('/deleteUser/:usertype', (req, res) => {
	console.log(chalk.cyan('POST ' + chalk.blue('/management/deleteUser')));
	if (req.params.usertype != "student" && req.params.usertype != "teacher") return res.json({
		success: false
	});
	let Usertype = require('../models/' + req.params.usertype);
	Usertype.deleteOne({
		username: req.body.username
	}, (err) => {
		if (err) return res.json({
			success: false,
			errorMsg: err.toString()
		});
		res.json({
			success: true
		});
	});
});

managementRouter.get('/schedules', (req, res) => {
	console.log(chalk.green('GET ' + chalk.blue('/management/schedules')));
	Schedule.find().populate('volunteersOpted').exec((err, schedules) => {
		if (err) throw err;
		let finalSchedules = [];
		schedules.forEach((schedule) => {
			let sched = schedule.toObject();
			for (let i = 0; i < sched.volunteersOpted.length; i++)
				sched.volunteersOpted[i] = sched.volunteersOpted[i].username;
			finalSchedules.push(sched);
		});
		res.json(finalSchedules);
	});
});

managementRouter.post('/addSchedule', (req, res) => {
	console.log(chalk.cyan('POST ' + chalk.blue('/management/addSchedule')));
	let schedule = new Schedule(req.body);
	schedule.save((err, result) => {
		if (err) {
			console.log(chalk.red(err));
			return res.json({
				success: false,
				errorMsg: err.toString()
			});
		}
		res.json({
			success: true
		});
	});
});

managementRouter.post('/deleteSchedule', (req, res) => {
	console.log(chalk.cyan('POST ' + chalk.blue('/management/deleteSchedule')));
	Schedule.deleteOne({
		name: req.body.name
	}, (err) => {
		if (err) {
			console.log(err);
			return res.json({
				success: false,
				errorMsg: err.toString()
			});
		}
		res.json({
			success: true
		});
	});
});

managementRouter.get('/donations', (req, res) => {
	console.log(chalk.green('GET ' + chalk.blue('/management/donations')));
	Donations.find().exec((err, donations) => {
		if (err) {
			console.log(chalk.red(err));
			return res.json({
				success: false
			});
		}
		let finalResults = [];
		for (let i = 0; i < donations.length; i++) finalResults.push({
			name: donations[i].name,
			email: donations[i].email,
			amountDonated: donations[i].amountDonated,
		});
		res.json({
			success: true,
			donations: finalResults
		});
	});
});

managementRouter.post('/addDonation', (req, res) => {
	console.log(chalk.cyan('POST ' + chalk.blue('/management/addDonation')));
	console.log(req.body)
	let schedule = new Donations(req.body);
	console.log(schedule);
	schedule.save((err, result) => {
		if (err) {
			console.log(chalk.red(err));
			return res.json({
				success: false,
				errorMsg: err.toString()
			});
		}
		res.json({
			success: true
		});
	});
});

module.exports = managementRouter;