import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());

const uri = process.env.MONGODBURL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("GM_International");
    const scholarshipPackage = db.collection("scholarship_package_management");

    app.get("/scholarship-package-management", async (req, res) => {
      const data = await scholarshipPackage.find().toArray();
      res.send(data);
      console.log(data)
    });

    console.log("Connected to MongoDB Atlas successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
