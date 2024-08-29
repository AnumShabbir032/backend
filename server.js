// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';

// // Create an instance of Express
// const app = express();
// const port = 3000;

// // Connect to MongoDB
// mongoose.connect('mongodb+srv://admin:admin@cluster0.z0bsx.mongodb.net/', {
   
// });


// // Define the Post schema and model
// const postSchema = new mongoose.Schema({
//     title: String,
//     content: String,
// });

// const Post = mongoose.model('Post', postSchema);

// // Middleware
// app.use(bodyParser.json());

// // POST request to create a new post
// app.post('/posts', async (req, res) => {
//     try {
//         const post = new Post(req.body);
//         await post.save();
//         res.status(201).json(post);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // GET request to retrieve all posts
// app.get('/posts', async (req, res) => {
//     try {
//         const posts = await Post.find();
//         res.status(200).json(posts);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // PUT request to update a post by ID
// app.put('/posts/:id', async (req, res) => {
//     try {
//         const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!post) return res.status(404).json({ message: 'Post not found' });
//         res.status(200).json(post);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // DELETE request to remove a post by ID
// app.delete('/posts/:id', async (req, res) => {
//     try {
//         const post = await Post.findByIdAndDelete(req.params.id);
//         if (!post) return res.status(404).json({ message: 'Post not found' });
//         res.status(200).json({ message: 'Post deleted' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });
