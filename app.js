import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
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
    const applicationSubmitCollection = db.collection('application_submit_by_user');
    const manageUniversity = db.collection('university_management');

    app.get("/admin/scholarship-package-management", async (req, res) => {
      const data = await scholarshipPackage.find().toArray();
      // console.log("Fetched data:", data); // check in server console
      res.send(data);
    });



    // get the single data
    app.get("/admin/scholarship-package-management/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const query = { _id: new ObjectId(id) };
        const result = await scholarshipPackage.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Package not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching package:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // sholarshipe data added tha db
    app.post("/admin/scholarship-package-management", async (req, res) => {
      const scholarshipData = req.body;
      const result = await scholarshipPackage.insertOne(scholarshipData);

      res.send(result);
    });

    // application submit on applicationSubmit collections

    app.post("/student-home-page/student-package-offer/user-application-form", async(req,res) =>{
      const applicationFormData = req.body;
      if(!applicationFormData){
        res.send("Data not found");
      }
      const result = await applicationSubmitCollection.insertOne(applicationFormData);

      if(!result){
        res.send("Something is worng mongodb not connected successfully")
      }

      res.send(result);
    })

    app.post('/mange-university/admin',async(req,res)=>{
      const universityData = req.body;

      if(!universityData){
        res.send("Data not found");
      }
      const result = await manageUniversity.insertOne(universityData);

      if(!result){
        res.send("Something is worng!! Database not connected successfully");
      }

      res.send(result);
    })


    app.get('/mange-university/admin', async(req,res)=>{
      const managedUniversityData = await manageUniversity.find().toArray();
      res.send(managedUniversityData)
    })


    // applicatoin collection get api
    app.get("/admin/manage-application", async(req,res)=>{
      const allApplicationData = await applicationSubmitCollection.find().toArray();
      res.send(allApplicationData) 
    })

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
