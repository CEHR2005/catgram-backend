require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const path = require('path');
const CatPost = require('./models/CatPost');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const cors = require('cors');
app.use(cors());

app.use(express.json());

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });



app.get('/', (req, res) => {
    res.send('Catstagram Server is running');
});

app.post('/posts', upload.single('image'), async (req, res) => {
    const { authorName, authorEmail, comment } = req.body;
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use('/uploads', express.static('uploads'));

app.get('/posts/images', async (req, res) => {
    try {
        const posts = await CatPost.find({});
        if (!posts) {
            return res.status(404).send('Posts not found');
        }
        const images = posts.map(post => {
            const localPath = path.join(__dirname, post.image);
            const urlPath = path.normalize(localPath.replace(__dirname, '')).replace(/\\/g, '/');
            return `http://localhost:3001${urlPath}`;
        });
        res.send(images);
    } catch (error) {
        res.status(500).send(error.message);
    }
});