const express = require('express');
const cors = require('cors');
const BodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fileUpload = require('express-fileupload');
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(BodyParser.json());
app.use(express.static('homeService'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fvccc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
	const usersCollection = client.db('home_service').collection('users');
	const doctorsCollection = client.db('home_service').collection('doctors');
	const appointmentCollection = client.db('home_service').collection('appointments');
	const patientCollection = client.db('home_service').collection('patients');
	const reviewCollection = client.db('home_service').collection('addReviews');


	console.log('Home Service DataBase Connected');


	// Root Route
	app.get('/', (req, res) => res.send('Welcome To Home Service Database'));

	//USER POST API 
	app.post('/users', async (req, res) => {
		const user = req.body;
		const result = await usersCollection.insertOne(user);
		// console.log(result);
		res.json(result);
	});

	app.get('/users', async (req, res) => {
		const cursor = usersCollection.find({});
		const user = await cursor.toArray();
		res.send(user)

	})

	app.put('/users/admin', async (req, res) => {
		const user = req.body;
		// console.log(user);
		const filter = { email: user.email };
		const options = { upsert: true };

		const updateDoc = { $set: { role: 'admin' } };
		const result = await usersCollection.updateOne(filter, updateDoc, options);
		res.json(result);
	})

	app.get('/users/:email', async (req, res) => {
		const email = req.params.email;
		const query = { email: email };
		const user = await usersCollection.findOne(query);
		let isAdmin = false;
		if (user?.role === 'admin') {
			isAdmin = true;
		}
		res.json({ admin: isAdmin });
	})

	//DELETE USER API
	app.delete('/deleteUser/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await usersCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})

	//DOCTORS POST API
	app.post('/doctors', async (req, res) => {
		const doctors = req.body;
		const result = await doctorsCollection.insertOne(doctors)
		// console.log(result);
		res.json(result)
	});

	//DOCTORS GET API
	app.get('/doctors', async (req, res) => {
		const cursor = doctorsCollection.find({});
		const doctors = await cursor.toArray();
		res.send(doctors)
	})

	//DOCTORS Single Item
	app.get('/doctors/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await doctorsCollection.findOne(query);
		res.send(result)
	})

	//DELETE DOCTORS API
	app.delete('/doctors/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await doctorsCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})


	//APPOINTMENT POST API
	app.post('/appointments', async (req, res) => {
		const appointments = req.body;
		const result = await appointmentCollection.insertOne(appointments)
		// const data = await patientCollection.insertOne(patients)
		// console.log(result);
		res.json(result)
	});

	//APPOINTMENT GET API
	app.get('/appointments', async (req, res) => {
		const cursor = appointmentCollection.find({});
		const result = await cursor.toArray();
		res.json(result);
	})

	//appointment status update
	app.patch("/update-status/:statusId", (req, res) => {
		const id = req.params.statusId;
		// console.log(id)
		const status = req.body.status;
		// console.log('abcd')
		// console.log(req.body)
		appointmentCollection
			.updateOne(
				{ _id: ObjectId(id) },
				{
					$set: {
						status,
					},
				}
			)
			.then((result) => {
				res.send({
					message: "delivery status updated successfully",
					modified: result.modifiedCount > 0,
				});
			});
	});


	//appointment meetlink update
	// app.patch("/update-meeting/:meetId", (req, res) => {
	// 	const meetId = req.params.meetId;
	// 	console.log(meetId)
	// 	const meetinglink = req.body.meetinglink;
	// 	console.log('abcd')
	// 	console.log(req.body)
	// 	appointmentCollection
	// 		.updateOne(
	// 			{ _id: ObjectId(meetId) },
	// 			{
	// 				$set: {
	// 					meetinglink,
	// 				},
	// 			}
	// 		)
	// 		.then((result) => {
	// 			res.send({
	// 				message: "delivery status updated successfully",
	// 				modified: result.modifiedCount > 0,
	// 			});
	// 		});
	// });

	//GET MEETING API
	app.get('/meeting/:id', async (req, res) => {
		const id = req.params.id;
		// console.log('this is id', id)
		const query = { _id: ObjectId(id) };
		const data = await appointmentCollection.findOne(query);
		res.send(data)
	})

	//PUT MEETING API
	app.put('/meeting/:id', async (req, res) => {
		const id = req.params.id;
		// console.log('this is id', id)
		const updatedLink = req.body;
		const filter = { _id: ObjectId(id) };
		const options = { upsert: true };
		const updateDoc = {
			$set: {
				meetingLink: updatedLink.meetingLink
			}
		}
		const data = await appointmentCollection.updateOne(filter, updateDoc, options);
		res.send(data)
	})

	//APPOINTMENT PAYMENT API
	app.get('/appointments/:id', async (req, res) => {
		const id = req.params.id;
		// console.log('this is id', id)
		const query = { _id: ObjectId(id) };
		const result = await appointmentCollection.findOne(query);
		res.send(result)
	})

	//APPOINTMENT PAYMENT SUCCESS API
	app.put('/appointments/:id', async (req, res) => {
		const id = req.params.id;
		const payment = req.body;
		const filter = { _id: ObjectId(id) }
		const updateDoc = {
			$set: {
				payment: payment
			}
		};
		const result = await appointmentCollection.updateOne(filter, updateDoc);
		res.json(result)
	})

	//DELETE APPOINTMENT API
	app.delete('/appointments/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await appointmentCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})

	//GET APPOINTMENT BY EMAIL
	app.get('/appointment/:email', async (req, res) => {
		// const email = req.query.email;
		const result = await appointmentCollection.find({ email: req.params.email }).toArray();
		// console.log(req.params.email)
		// console.log(result);
		res.send(result)
	})

	//Cancel Appointments API
	app.delete('/cancelAppointments/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await appointmentCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})

	// Added A New Doctor Review
	app.post('/addReviews', async (req, res) => {
		const review = req.body;
		const result = await reviewCollection.insertOne(review)
		// console.log(result);
		res.json(result)
	});

	//REVIEW POST API
	app.post('/addReview', (req, res) => {
		const reviewData = req.body;
		reviewCollection.insertOne(reviewData).then((result) => {
			res.send(result.insertedCount > 0);
			console.log(result.insertedCount, 'Review Data Inserted');
		});
	});

	//REVIEW GET API
	app.get('/addReviews', async (req, res) => {
		const cursor = reviewCollection.find({});
		const result = await cursor.toArray();
		res.send(result)
	})

	//GET PAYMENT API
	app.post("/create-payment-intent", async (req, res) => {
		const paymentInfo = req.body;
		const amount = paymentInfo.price * 100;
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount,
			currency: "BDT",
			payment_method_types: ['card']
		});

		res.json({
			clientSecret: paymentIntent.client_secret,
		});
	});

});


app.listen(port, (err) => (err ? console.log('Filed to Listen on Port', port) : console.log('Listing for Port', port)));
