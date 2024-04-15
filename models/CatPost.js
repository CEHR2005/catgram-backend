const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  authorName: String,
  authorEmail: String,
  comment: String,
  dateAdded: { type: Date, default: Date.now },
  replies: [this],
});

const catPostSchema = new mongoose.Schema({
  image: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  comments: [commentSchema],
  comment: String,
  dateAdded: { type: Date, default: Date.now },
  hashtags: [String],
});

const CatPost = mongoose.model("CatPost", catPostSchema);

module.exports = CatPost;
