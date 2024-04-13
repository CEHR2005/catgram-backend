const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = new User({ username, email, password: password });

  try {
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send("User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(400).send("Invalid password");
  }

  res.status(200).send(user);
});

module.exports = router;
