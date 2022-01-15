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
	const servicesCollection = client.db('home_service').collection('services');
	const engineersCollection = client.db('home_service').collection('engineers');
	const bookedServicesCollection = client.db('home_service').collection('bookedServices');
	const reviewCollection = client.db('home_service').collection('addReviews');
	const blogsCollection = client.db('home_service').collection('addBlogs');


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

	//ENGINEERS POST API
	app.post('/engineers', async (req, res) => {
		const engineers = req.body;
		const result = await engineersCollection.insertOne(engineers)
		// console.log(result);
		res.json(result)
	});

	//ENGINEERS GET API
	app.get('/engineers', async (req, res) => {
		const cursor = engineersCollection.find({});
		const engineers = await cursor.toArray();
		res.send(engineers)
	})

	//DELETE ENGINEERS API
	app.delete('/deleteEngineer/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await engineersCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})

	//SERVICES POST API
	app.post('/services', async (req, res) => {
		const services = req.body;
		const result = await servicesCollection.insertOne(services)
		// console.log(result);
		res.json(result)
	});

	//SERVICES GET API
	app.get('/services', async (req, res) => {
		const cursor = servicesCollection.find({});
		const services = await cursor.toArray();
		res.send(services)
	})

	//SERVICES GET BY ID
	app.get('/services/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await servicesCollection.findOne(query);
		res.send(result)
	})

	//DELETE SERVICES API
	app.delete('/services/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await servicesCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})


	//BOOKING SERVICE POST API
	app.post('/bookedServices', async (req, res) => {
		const services = req.body;
		const result = await bookedServicesCollection.insertOne(services)
		res.json(result)
	});

	//Booked Services GET API
	app.get('/bookedServices', async (req, res) => {
		const cursor = bookedServicesCollection.find({});
		const result = await cursor.toArray();
		res.json(result);
	})

	//Booked Services PAYMENT API
	app.get('/bookedServices/:id', async (req, res) => {
		const id = req.params.id;
		// console.log('this is id', id)
		const query = { _id: ObjectId(id) };
		const result = await bookedServicesCollection.findOne(query);
		res.send(result)
	})

	//Booked Services PAYMENT SUCCESS API
	app.put('/bookedServices/:id', async (req, res) => {
		const id = req.params.id;
		const payment = req.body;
		const filter = { _id: ObjectId(id) }
		const updateDoc = {
			$set: {
				payment: payment
			}
		};
		const result = await bookedServicesCollection.updateOne(filter, updateDoc);
		res.json(result)
	})

	//DELETE Booked Services API
	app.delete('/bookedServices/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await bookedServicesCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})

	//GET Booked Services BY EMAIL
	app.get('/bookedService/:email', async (req, res) => {
		// const email = req.query.email;
		const result = await bookedServicesCollection.find({ email: req.params.email }).toArray();
		// console.log(req.params.email)
		// console.log(result);
		res.send(result)
	})

	//Cancel Booked Services API
	app.delete('/cancelBookedServices/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await bookedServicesCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})

	// Added A New Service Review
	app.post('/addReviews', async (req, res) => {
		const review = req.body;
		const result = await reviewCollection.insertOne(review)
		// console.log(result);
		res.json(result)
	});
	app.post('/addReview', async (req, res) => {
		const reviewData = req.body;
		const result = await reviewCollection.insertOne(reviewData)
		// console.log(result);
		res.json(result)
	});

	//REVIEW POST API
	// app.post('/addReview', (req, res) => {
	// 	const reviewData = req.body;
	// 	reviewCollection.insertOne(reviewData).then((result) => {
	// 		res.send(result.insertedCount > 0);
	// 		console.log(result.insertedCount, 'Review Data Inserted');
	// 	});
	// });

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

	//BLOGS POST API
	app.post('/blogs', async (req, res) => {
		const blog = req.body;
		const result = await blogsCollection.insertOne(blog)
		// console.log(result);
		res.json(result)
	});

	//BLOGS GET API
	app.get('/blogs', async (req, res) => {
		const cursor = blogsCollection.find({});
		const blogs = await cursor.toArray();
		res.send(blogs)
	})

	//BLOGS GET BY ID
	app.get('/blogs/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await blogsCollection.findOne(query);
		res.send(result)
	})

	//DELETE BLOGS API
	app.delete('/deleteBlogs/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const result = await blogsCollection.deleteOne(query);
		// console.log(result);
		res.send(result)
	})

});


app.listen(port, (err) => (err ? console.log('Filed to Listen on Port', port) : console.log('Listing for Port', port)));
