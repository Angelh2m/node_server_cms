const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const nodemailer = require('nodemailer');
const gravatar = require('gravatar');

const keys = require('../../config/keys');

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
    const offset = Number(req.query.offset) || 0;

    Post.find()
        .skip(offset)
        .limit(5)
        .populate('likes.user', 'name avatar')
        .populate('comments.user', 'name date avatar')
        .sort({ 'entry.date': -1 })
        .then(post => {
            Post.count().then(el => {
                res.status(200).json({
                    count: el,
                    post,
                })
            })
        })
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
        entry: {
            title: req.body.title,
            excerpt: req.body.excerpt,
            body: req.body.body,
            author: req.user.id,
            tags: req.body.tags,
            category: req.body.category
        }
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
router.post('/comment/:id', (req, res, next) => {
    const replyId = req.body.replyId;
    const userEmail = req.body.email;
    let commentIndex;
    let newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        email: userEmail,
        isApproved: false
    }

    // If user has a payload
    if (!userEmail) {
        console.log('NO REGISTERED ');

        passport.authenticate('jwt', { session: false }, (err, user, info) => {

            newComment.user = user.id;

            Post.findById(req.params.id)
                .populate('comments.user', 'date email name avatar')
                .then(post => {

                    console.log(replyId);
                    if (replyId) {
                        post.comments.findIndex((el, index) => {
                            el._id == replyId ? commentIndex = index : null;
                        });
                    }

                    // There is a reply 
                    if (commentIndex) {
                        post.comments[commentIndex].replies.unshift(newComment);
                        console.log(post.comments[commentIndex].replies);
                    }

                    // It only a comment
                    if (!commentIndex) {
                        post.comments.unshift(newComment);
                    }

                    // post.save().then(post => {
                    //     return res.status(200).json({
                    //         post
                    //     })
                    // }).catch(err => res.status(404).json({
                    //     message: 'Error trying to post your comment'
                    // }))

                    return res.status(200).json({
                        ok: true,
                        post
                    })

                }).catch(err => res.status(400).json({
                    ok: false,
                    message: 'The post ID does not exist',
                    err
                }))


        })(req, res, next);

    }

    // If it's a one time user login
    if (userEmail) {

        //     // newComment.avatar = gravatar.url(userEmail, {
        //     //     s: '200', // Size
        //     //     r: 'pg', // Rating
        //     //     d: 'mm' // Default
        //     // });

        console.log(userEmail);

        Post.findById(req.params.id)
            .then(post => {

                // There is a reply 
                // if (commentIndex) {
                //     post.comments.findIndex((el, index) => {
                //         // el._id == replyId ? commentIndex = index : null;
                //     });
                //     post.comments[commentIndex].replies.unshift(newComment);
                // }

                // It only a comment
                if (!commentIndex) {
                    post.comments.unshift(newComment);
                    console.log(newComment);
                }



                post.save().then(post => {
                        res.status(200).json({
                            post
                        });
                    })
                    .catch(err => res.status(404).json({
                        message: 'Error trying to post your comment',
                        err
                    }))

                // return res.status(200).json({
                //     ok: true,
                //     post
                // });

            }).catch(err => res.status(400).json({
                ok: false,
                message: 'The post ID does not exist',
                err
            }))
    }

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


        nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: keys.googleEmailAccount, // generated ethereal user
                    pass: keys.googlePasswordAccount // generated ethereal password
                }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Fred Foo 👻" <angelh2m@gmail.com>', // sender address
                to: 'angelh2m@gmail.com', // list of receivers
                subject: 'Hello ✔', // Subject line
                text: 'Hello world?', // plain text body
                html: '<b>Hello world</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            });
        });


        entry.save()
            .then(el => res.status(200).json({ el }))
            .catch(err => res.status(400).json({ err }))

    });
});






module.exports = router;