const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Post model
const Post = require('../../models/Post');
const User = require('../../models/User');

// Profile model
// const Profile = require('../../models/Profile')

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public

router.get('/all/:search', (req, res) => {

    const search = req.params.search;
    const regex = new RegExp(search, 'i')

    Post.find({ 'entry.title': regex }).then(results => {
        res.json({
            msg: 'Search Works',
            results
        })
    })

});

module.exports = router;