const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PostSchema = new Schema({

    entry: {

        title: {
            type: String,
            required: true
        },
        excerpt: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        tags: {
            type: String
        },
        category: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
    },
    likes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    }],
    quickreply: [{
        options: {
            type: String,
            required: true
        },
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        text: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        avatar: {
            type: String
        },
        email: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        isApproved: {
            type: String,
            default: true
        },
        replies: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            email: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            },
            isApproved: {
                type: String
            }
        }]
    }]

});

module.exports = Post = mongoose.model('post', PostSchema);