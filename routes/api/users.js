const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   GET api/users/register
// @desc    Register route
// @access  Public
router.post('/register', (req, res) => {
    //   const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation
    //   if (!isValid) {
    //     return res.status(400).json(errors);
    //   }

    User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            var errors = 'Email already exists';
            return res.status(400).json(errors);
        } else {
            // Get the gravatar
            const avatar = gravatar.url(req.body.email, {
                s: '200', // Size
                r: 'pg', // Rating
                d: 'mm' // Default
            });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then((user) => res.json(user))
                        .catch((err) => console.log(err));
                });
            });
        }
    });
});

// @route   GET api/users/login
// @desc    Login the user // Provide token to user
// @access  Public

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email }).then((user) => {
        if (!user) {
            return res.status(404).json({
                email: 'User not found'
            });
        }

        // Check if the password is correct
        bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                // User match
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                }; // Create jwt payload

                // Sign the token
                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                    return res.json({
                        success: true,
                        token: `Bearer ${token}`
                    })
                });


            }

            if (!isMatch) {
                return res.status(400).json({
                    password: 'Incorrect password'
                });
            }
        });
    });
});

// @route   GET api/users/current
// @desc    Return current user // Protected route using token
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        req.user.password = ":)";

        res.json({
            user: req.user
        })
    }

);

// @route   GET api/users/current
// @desc    Return current user // Protected route using token
// @access  Private
// router.get('/all', (req, res) => {
//     console.log('All users ');

//     User.find().then(all => res.status(200).json({ all }))
// });


module.exports = router;