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
        .populate('likes.user', 'name avatar')
        .populate('comments.user', 'name date avatar')
        .sort({ date: -1 })
        .then(post => res.status(200).json({
            post
        }))
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

    const newPost = new Post({
        title: req.body.title,
        excerpt: req.body.excerpt,
        body: req.body.body,
        author: req.user.id,
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
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findById(req.params.id).then(post => {


        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(401).json({
                ok: false,
                message: `${req.user.name}, you have already liked this post`,
            })
        }

        post.likes.unshift({ user: req.user.id });

        console.log(post.likes);

        post.save()
            .then((entry) => {
                res.status(200).json({
                    ok: true,
                })
            })
            .catch((err) => {
                res.status(404).json({
                    ok: false,
                    message: 'Unable to like the post'
                })
            })

    }).catch(err => res.status(404).json({ message: 'Sorry, at this time you can\'t like this post' }))

});



// @route   GET api/posts/comment/:id
// @desc    Create a new Comment
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findById(req.params.id).then(post => {

        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id,
            isApproved: false
        }

        post.comments.unshift(newComment);

        post.save().then(post => {
            res.status(200).json({
                post
            })
        }).catch(err => res.status(404).json({
            message: 'Post not found'
        }))

    }).catch(err => res.status(400).json({ err }))
});


// @route   PUT api/comment/:id
// @desc    Approve comments
// @access  Private
router.put('/comment/:id', (req, res) => {

    Post.findById(req.params.id).then(entry => {

        const isApproved = req.body.isApproved;
        const commentId = req.body.id;
        let commentID;
        entry.comments.findIndex((el, index) => {
            el.id == commentId ? commentID = index : null;
        })

        entry.comments[commentID].isApproved = isApproved;
        console.log(entry.comments[commentID].isApproved);

        entry.save()
            .then(el => res.status(200).json({ el }))
            .catch(err => res.status(400).json({ err }))

    });
});






module.exports = router;