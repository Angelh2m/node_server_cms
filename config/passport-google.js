const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');

module.exports = (passport) => {

    passport.serializeUser((user, done) => {
        console.log("USER ID", user.id);
        done(null, user.id);

    });
    passport.deserializeUser((id, done) => {
        console.log('USER DESERIALIZE ');
        done(null, user);

    });

    passport.use(
        new GoogleStrategy({
            callbackURL: '/api/oauth/redirect',
            clientID: keys.googleClientID,
            clientSecret: keys.clientSecret,
        }, (accessToken, refreshToken, profile, done) => {

            User.findOne({ googleId: profile.id }).then((currentUser) => {
                if (currentUser) {
                    //Already a user
                    // console.log('USer already registered', currentUser);
                    return done(null, currentUser);
                }

                if (!currentUser) {
                    //New user
                    const NewUser = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        avatar: profile._json.image.url,
                    });

                    NewUser.save().then(user => {
                        console.log(user, " NEW USER CREATED");
                    });
                }

            })
        })
    )
}