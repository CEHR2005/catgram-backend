import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import User from "./models/User.js";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected...");
    createAdminAccount().then((r) => console.log(r));
  })
  .catch((err) => console.log(err));

async function createAdminAccount() {
  const adminUser = await User.findOne({ role: "admin" });

  if (!adminUser) {
    const admin = new User({
      username: "admin",
      email: "admin@example.com",
      password: "admin",
      role: "admin",
    });

    try {
      await admin.save();
      console.log("Admin account created");
    } catch (error) {
      console.error("Error creating admin account: ", error);
    }
  }
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Importing routes
app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Catstagram Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
