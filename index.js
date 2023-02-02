const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kflgpze.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("picman").collection("services");
    const reviewCollection = client.db("picman").collection("reviews");
    const orderCollection = client.db("picman").collection("orders");

    // services api
    app.get("/services", async (req, res) => {
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(size).toArray();
      res.send(services);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    // reviews api
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = await reviewCollection.findOne(query);
      res.send(review);
    });
    app.get("/reviewsByServiceId/:id", async (req, res) => {
      const { id } = req.params;
      const query = { serviceId: id };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.get("/reviewsByUser/:user", async (req, res) => {
      const { user } = req.params;
      const query = { email: user };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const review = req.body;
      const query = { _id: ObjectId(id) };
      const updateReview = {
        $set: {
          name: review.name,
          rating: review.rating,
          photoUrl: review.photoUrl,
          reviewText: review.reviewText,
        },
      };
      const result = await reviewCollection.updateOne(query, updateReview);
      res.send(result);
    });
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // order api
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

// api calls
app.get("/", (req, res) => {
  res.send("Server Started");
});

app.listen(port, () => console.log("Start on port", port));
