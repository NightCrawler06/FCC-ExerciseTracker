const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Basic Configuration
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// to be replace with database in production
let users = [];
let exercises = [];
let userId = 1;

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

// Create a new user
app.post("/api/users", (req, res) => {
	const { username } = req.body;
	const newUser = {
		username,
		_id: userId.toString(),
	};
	users.push(newUser);
	userId++;
	res.json(newUser);
});

// Get all users
app.get("/api/users", (req, res) => {
	res.json(users);
});

// Add exercise for a user
app.post("/api/users/:_id/exercises", (req, res) => {
	const { description, duration, date } = req.body;
	const { _id } = req.params;

	const user = users.find((u) => u._id === _id);
	if (!user) return res.status(404).send("User not found");

	const exercise = {
		description: String(description),
		duration: Number(duration),
		date: date ? new Date(date).toDateString() : new Date().toDateString(),
	};

	exercises.push({ ...exercise, userId: _id });

	res.json({
		_id: user._id,
		username: user.username,
		...exercise,
	});
});

// Get user's exercise log
app.get("/api/users/:_id/logs", (req, res) => {
	const { _id } = req.params;
	const { from, to, limit } = req.query;

	const user = users.find((u) => u._id === _id);
	if (!user) return res.status(404).send("User not found");

	let log = exercises
		.filter((e) => e.userId === _id)
		.map(({ description, duration, date }) => ({
			description,
			duration,
			date,
		}));

	if (from) {
		const fromDate = new Date(from);
		log = log.filter((e) => new Date(e.date) >= fromDate);
	}

	if (to) {
		const toDate = new Date(to);
		log = log.filter((e) => new Date(e.date) <= toDate);
	}

	if (limit) {
		log = log.slice(0, Number(limit));
	}

	res.json({
		_id: user._id,
		username: user.username,
		count: log.length,
		log,
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
