require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cors = require("cors");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

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
