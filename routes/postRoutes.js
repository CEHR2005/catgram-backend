// Initialize express router
import path from 'path'

// Configuring storage for multer
import multer from "multer";
import express from "express";
import CatPost from "../models/CatPost.js";
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
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
  const hashtags = comment.match(/#\w+/g) || [];
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
      hashtags,
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
  const hashtags = comment.match(/#\w+/g) || [];
  try {
    const post = await CatPost.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    post.comments.push({ authorName, authorEmail, comment });
    post.hashtags.push(...hashtags);
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /posts/hashtags:
 *   get:
 *     summary: Retrieve a list of hashtags
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of hashtags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 */
router.get("/hashtags", async (req, res) => {
  try {
    const posts = await CatPost.find({});
    let hashtags = [];
    posts.forEach((post) => {
      hashtags = [...hashtags, ...post.hashtags];
    });
    const uniqueHashtags = [...new Set(hashtags)];
    res.status(200).send(uniqueHashtags);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /posts/hashtags/{hashtag}:
 *   get:
 *     summary: Retrieve a list of posts by hashtag
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: hashtag
 *         required: true
 *         schema:
 *           type: string
 *         description: The hashtag
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
router.get("/hashtags/:hashtag", async (req, res) => {
  const { hashtag } = req.params;
  try {
    const posts = await CatPost.find({ hashtags: "#" + hashtag });
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send(error.message);
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

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       400:
 *         description: Error occurred
 *       404:
 *         description: Post not found
 */
router.delete("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await CatPost.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.status(200).send("Post deleted successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment from a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       400:
 *         description: Error occurred
 *       404:
 *         description: Post or comment not found
 */
router.delete("/:postId/comments/:commentId", async (req, res) => {
  const { postId, commentId } = req.params;
  try {
    const post = await CatPost.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const commentIndex = post.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).send("Comment not found");
    }
    post.comments.splice(commentIndex, 1);
    await post.save();
    res.status(200).send("Comment deleted successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}/replies:
 *   post:
 *     summary: Add a reply to a comment
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
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
 *         description: Reply added successfully
 *       400:
 *         description: Error occurred
 */
router.post("/:postId/comments/:commentId/replies", async (req, res) => {
  const { postId, commentId } = req.params;
  const { authorName, authorEmail, comment } = req.body;
  let hashtags = comment.match(/#\w+/g) || [];
  try {
    const post = await CatPost.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const parentComment = post.comments.id(commentId);
    if (!parentComment) {
      return res.status(404).send("Comment not found");
    }
    parentComment.replies.push({ authorName, authorEmail, comment });
    post.hashtags.push(...hashtags);
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Retrieve a post by its ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await CatPost.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;