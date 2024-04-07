const mongoose = require('mongoose');

const catPostSchema = new mongoose.Schema({
    image: { type: String, required: true }, // Ссылка на изображение
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    comment: String,
    dateAdded: { type: Date, default: Date.now },
    // hashtags можно извлечь из комментариев при запросе, не обязательно хранить как поле
});

const CatPost = mongoose.model('CatPost', catPostSchema);

module.exports = CatPost;
