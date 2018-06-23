const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');


module.exports = (passport) => {

    passport.use(
        new GoogleStrategy({
            callbackURL: '/api/oauth/redirect',
            clientID: "880894139984-mh6nusr9huc6jafeuqc30cv5babqmvh5.apps.googleusercontent.com",
            clientSecret: "EVasKnGjtT5QmuQrk7FLwzsK"
        }, (accessToken, refreshToken, profile, done) => {

            User.findOne({ googleId: profile.id }).then((currentUser) => {
                if (currentUser) {
                    //Already a user
                    console.log('USer already registered');

                }

                if (!currentUser) {
                    //New user
                    const NewUser = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        avatar: profile._json.image.url,

                    })

                    NewUser.save().then(user => {
                        console.log(user, " NEW USER CREATED");
                    });
                }

            })



        })
    )
}