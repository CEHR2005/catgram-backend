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
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - authorName
 *               - authorEmail
 *               - comment
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               authorName:
 *                 type: string
 *               authorEmail:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Error occurred
 */
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

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorName
 *               - authorEmail
 *               - comment
 *             properties:
 *               authorName:
 *                 type: string
 *               authorEmail:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Error occurred
 */
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

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieve a list of posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: Posts not found
 *       500:
 *         description: Server error
 */
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
