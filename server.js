require("dotenv").config();
const User = require("./models/User");
require("bcrypt");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cors = require("cors");

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
const postRoutes = require("./routes/PostRoute");
app.use("/posts", postRoutes);

const userRoutes = require("./routes/UserRoute");
app.use("/users", userRoutes);

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Catstagram Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
