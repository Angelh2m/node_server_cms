const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');
const User = require('../../models/User');

// Profile model
// const Profile = require('../../models/Profile')

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

// @route   GET api/posts/
// @desc    Get all the posts
// @access  Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(post => res.status(200).json(post))
        .catch(err => res.status(404).json({
            noPostFound: 'No posts found',
            err
        }))
});

// @route   GET api/posts/
// @desc    Get single post by ID
// @access  Public
router.get('/:id', (req, res) => {

    Post.findById(req.params.id)
        .then(post => res.status(200).json(post))
        .catch(err => res.status(404).json({
            noPostFound: 'No post found with that id',
            err
        }))
});

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    // if (!isValid) {
    //     // If any errors, send 400 with errors object
    //     return res.status(400).json(errors);
    // }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
        tags: req.body.tags,
        category: req.body.category
    });

    newPost.save().then(post => res.json(post));
});


// @route   POST api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    User.findById(req.user.id).then(profile => {

        Post.findById(req.params.id).then(post => {

            if (post.user.toString() !== profile.id) {
                return res.status(401).json({
                    message: "You don't have rights to delete this post"
                });
            }

            if (post.user == profile.id) {
                post.remove()
                    .then(() => {
                        res.json({
                            success: true
                        })
                    })
                    .catch((err) => {
                        res.status(404).json({
                            message: 'Unable to delete post with id'
                        })
                    })
            }

        })
    });

});


// @route   GET api/posts/like/:id
// @desc    Like the post
// @access  Public
router.post('/like/:id', (req, res) => {

    Post.findById(req.params.id).then(post => {

        // console.log(req.params.id)

        post.likes.push({ user: 'liked' });

        post.save().then(() => {
                res.json({
                    success: true,
                    likes: post.likes
                })
            })
            .catch((err) => {
                res.status(404).json({
                    message: 'Unable to like the post'
                })
            })

    });

});


module.exports = router;