const express = require('express');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

router.get('/', (req, res) => res.render('home'));

/* *
 *  Send to the consent screen
 */
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));


router.get('/redirect', passport.authenticate('google'), (req, res) => {
    console.log(req.user);
    console.log('REDIRECTED');

    const payload = {
        id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar
    }; // Create jwt payload

    // Sign the token
    jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
        // return res.json({
        //     success: true,
        //     token: `Bearer ${token}`
        // })
        // console.log(token);
        res.status(200).json({
            user: req.user,
            message: 'success',
            token
        })

        return token

    });


});


module.exports = router;