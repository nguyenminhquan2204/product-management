const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const blogSchema = new mongoose.Schema(
    {
        title: String,
        blog_category_id: {
            type: String,
            default: "",
        },
        description: String,
        thumbnail: String,
        status: String,
        featured: String,
        position: Number,
        slug: {
            type: String,
            slug: "title",
            unique: true
        },
        createdBy: {
            account_id: String,
            createAt: {
                type: Date,
                default: Date.now
            }
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedBy: {
            account_id: String,
            deletedAt: Date
        },
        updatedBy: [
            {
                account_id: String,
                updateAt: Date
            }
        ],
        // deletedAt: Date
    },  
    {
        timestamps: true
    }
);

const Blog = mongoose.model('Blog', blogSchema, "blogs");

module.exports = Blog;
