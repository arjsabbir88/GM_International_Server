import express from "express";
import cors from "cors";
import { ClientSession, MongoClient, ObjectId, ServerApiVersion } from "mongodb";
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
    const applicationSubmitCollection = db.collection(
      "application_submit_by_user"
    );
    const manageUniversity = db.collection("university_management");
    const usersCollection = db.collection("users");

    app.get("/admin/scholarship-package-management", async (req, res) => {
      const data = await scholarshipPackage.find().toArray();

      res.send(data);
    });

    app.get("/users/user-role", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.send({ userRole: "user" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.send({ userRole: "user" });
      }
      res.send({ userRole: user.userRole });
    });

    app.get("/user/application-status", async (req, res) => {
      const email = req.query.email;
      
      if (!email) {
        return res.send({ status: "No applications found" });
      }
      const query = { email: email };
      const applications = await applicationSubmitCollection
        .find(query)
        .toArray();
      if (applications.length === 0) {
        return res.send({ status: "No applications found" });
      }
      res.send(applications);
    });

    app.get("/user/get-profile-info", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.send({ message: "Email is not exit in your query" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.send({ message: "User not found" });
      }
      res.send(user);
    });

    app.get("/user/get-avatar", async(req, res)=>{
      const email = req.query.email;
      
      if(!email){
        return res.send({message: "Email is not exit in your query"});
      }

      const query = {email: email};
      const user = await usersCollection.findOne(query);
      

      if(!user){
        return res.send({message: "user not found"});
      }
      res.json({ avatar: user.avatar })
    })

    app.patch("/user/update-application/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = { ...req.body };

        // 🔥 Make sure _id field never goes to MongoDB update
        delete updatedData._id;

        if (!updatedData || Object.keys(updatedData).length === 0) {
          return res.status(400).json({ message: "No fields to update" });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: updatedData };

        const result = await applicationSubmitCollection.updateOne(
          filter,
          updateDoc
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({
          message: "Application updated successfully",
          modifiedCount: result.modifiedCount,
        });
      } catch (error) {
        console.error("Error updating application:", error);
        res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
    });














    app.put("/user/updated-profile/:id", async (req, res) => {
      try {
        const userId = req.params.id;

        // Validate ObjectId
        let objectId;
        try {
          objectId = new ObjectId(userId);
        } catch {
          return res
            .status(400)
            .json({ success: false, message: "Invalid user ID" });
        }

        const { username, email, phone, avatar } = req.body;

        // Build update object dynamically
        const updateData = { updatedAt: new Date() };
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (avatar) updateData.avatar = avatar;

        // Update the user and return the updated document
        const updatedUser = await usersCollection.findOneAndUpdate(
          { _id: objectId },
          { $set: updateData },
          { returnDocument: "after" } // return the updated document
        );

        // console.log("updated user",updatedUser)

        if (!updatedUser) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          data: updatedUser.value,
        });
      } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
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

    app.post(
      "/student-home-page/student-package-offer/user-application-form",
      async (req, res) => {
        const applicationFormData = req.body;
        if (!applicationFormData) {
          res.send("Data not found");
        }
        const result = await applicationSubmitCollection.insertOne(
          applicationFormData
        );

        if (!result) {
          res.send("Something is worng mongodb not connected successfully");
        }

        res.send(result);
      }
    );

    app.post("/mange-university/admin", async (req, res) => {
      const universityData = req.body;

      if (!universityData) {
        res.send("Data not found");
      }
      const result = await manageUniversity.insertOne(universityData);

      if (!result) {
        res.send("Something is worng!! Database not connected successfully");
      }

      res.send(result);
    });

    app.get("/mange-university/admin", async (req, res) => {
      const managedUniversityData = await manageUniversity.find().toArray();
      res.send(managedUniversityData);
    });

    app.get(`/manage-university/details/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await manageUniversity.findOne(query);

      if (!result) return res.send("Data not found");

      res.send(result);
    });

    // applicatoin collection get api
    app.get("/admin/manage-application", async (req, res) => {
      const allApplicationData = await applicationSubmitCollection
        .find()
        .toArray();
      res.send(allApplicationData);
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
