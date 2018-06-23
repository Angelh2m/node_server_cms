const express = require('express');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose');



router.get('/', (req, res) => res.render('home'));

router.get('/redirect', passport.authenticate('google'), (req, res) => {
    console.log(req.user);


    res.send('Call back URL')

});

/* *
 *  Send to the consent screen
 */
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

module.exports = router;