const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');
dotenv.config();
const { User } = require('../models');
const { sequelize } = require('../config/db');
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findByPk(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => done(err));
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            clientSecret: process.env.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
            callbackURL: '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            const transaction = await sequelize.transaction();
            try {
                const existingUser = await User.findOne({ where: { socialId: profile.id },
                    transaction  
                });
                if (existingUser) {
                    await transaction.rollback();
                    return done(null, existingUser);
                }
                const newUser = await User.create({
                    email: profile.emails[0].value,
                    username: profile.emails[0].value.split('@')[0],
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    socialId: profile.id
                });
                await transaction.commit();
                done(null, newUser);
            } catch (err) {
                await transaction.rollback();
                done(err);
            }
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.SOCIAL_AUTH_FACEBOOK_KEY,
            clientSecret: process.env.SOCIAL_AUTH_FACEBOOK_SECRET,
            callbackURL: '/api/auth/facebook/callback',
            profileFields: ['id', 'emails', 'name', 'picture'],
            scope: ['public_profile']
        },
        async (accessToken, refreshToken, profile, done) => {
            const transaction = await sequelize.transaction();
            try {
                // Check if user exists by Facebook ID
                let user = await User.findOne({ 
                    where: { socialId: profile.id },
                    transaction 
                });

                if (!user) {
                    // Check if user exists by email
                    if (profile.emails && profile.emails[0]) {
                        user = await User.findOne({ 
                            where: { email: profile.emails[0].value },
                            transaction 
                        });
                    }

                    if (!user) {
                        // Create new user
                        user = await User.create({
                            email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
                            username: profile.name.givenName.toLowerCase() + profile.id.slice(-4),
                            firstName: profile.name.givenName,
                            lastName: profile.name.familyName,
                            socialId: profile.id,
                        }, { transaction });
                    } else {
                        // Update existing user with Facebook ID
                        user.socialId = profile.id;
                        await user.save({ transaction });
                    }
                }
                await transaction.commit();
                return done(null, user);
            } catch (error) {
                await transaction.rollback();
                return done(error, null);
            }
        }
    )
);
