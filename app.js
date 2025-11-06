import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

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

    app.get("/admin/scholarship-package-management", async (req, res) => {
      const data = await scholarshipPackage.find().toArray();
      console.log("Fetched data:", data); // check in server console
      res.send(data);
    });

    // sholarshipe data added tha db
    app.post("/admin/scholarship-package-management", async (req, res) => {
      const scholarshipData = req.body;
      const result = await scholarshipPackage.insertOne(scholarshipData);
      console.log(result);
      res.send(result);
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
