const mongoose = require('mongoose'); // -----------------------require mongoose
const Schema = mongoose.Schema; // -----------------------------create a new mongoose Schema

const blogSchema = new Schema({ // -----------------------------define structure of followed Schema 
    title: {
        type: String
    },
    userId: {
        type: String
    }
}, { timestamps: true }); // ----------------------------------stamps with createdAt and updatedAt


const Blog = mongoose.model('Blog', blogSchema); // -----------Blog is now equal to schema with a followed structure

module.exports = Blog; // -------------------------------------export Blog