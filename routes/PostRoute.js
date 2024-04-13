const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const CatPost = require("../models/CatPost");

// Configuring storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});

// Creating an upload instance with the storage configuration
const upload = multer({ storage: storage });

// Route to create a post with an image
router.post("/", upload.single("image"), async (req, res) => {
  const { authorName, authorEmail, comment } = req.body;
  if (!req.file) {
    return res.status(400).send("No file received");
  }
  const image = req.file.path;
  try {
    const newPost = await CatPost.create({
      image,
      authorName,
      authorEmail,
      comment,
    });
    res.status(201).send(newPost);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Route to get all images
router.get("/images", async (req, res) => {
  try {
    const posts = await CatPost.find({});
    if (!posts) {
      return res.status(404).send("Posts not found");
    }
    const images = posts.map((post) => {
      const localPath = path.join(__dirname, "..", post.image);
      const urlPath = path
        .normalize(localPath.replace(__dirname, ""))
        .replace(/\\/g, "/");
      return `http://localhost:3000${urlPath}`;
    });
    res.send(images);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route to add a comment to a post
router.post("/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const { authorName, authorEmail, comment } = req.body;
  try {
    const post = await CatPost.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    post.comments.push({ authorName, authorEmail, comment });
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Route to get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await CatPost.find({});
    if (posts.length > 0) {
      res.status(200).send(posts);
    } else {
      res.status(404).send("Posts not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
