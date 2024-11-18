const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://xeno-backend-7gq4.onrender.com/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          email: profile.emails[0].value,
        };
  
        try {
          let user = await User.findOne({ googleId: profile.id });
  
          if (user) {
            // User exists, update profile
            user = await User.findOneAndUpdate({ googleId: profile.id }, newUser, { new: true });
            done(null, user);
          } else {
            // Create new user
            user = await new User(newUser).save();
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // passport.deserializeUser(async (id, done) => {
  //   try {
  //     const user = await User.findById(id);
  //     done(null, user);
  //   } catch (err) {
  //     done(err, null);
  //   }
  // });
  passport.deserializeUser(async (id, done) => {
    try {
      console.log('Deserializing user with ID:', id);
      const user = await User.findById(id);
      console.log('User found during deserialization:', user);
      done(null, user);
    } catch (err) {
      console.error('Error during deserialization:', err);
      done(err, null);
    }
  });
  
  
  module.exports = passport;