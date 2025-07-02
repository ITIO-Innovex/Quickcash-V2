const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const axios = require('axios');
const { User } = require('../models/user.model');

// LinkedIn OAuth Strategy using OpenID-style scopes
passport.use(new LinkedInStrategy(
  {
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL,
    scope: ['openid', 'profile', 'email'], // ✅ Use OpenID scopes only
    state: true,
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, params, profile, done) => {
    try {
      // ✅ Use LinkedIn's userinfo endpoint for OpenID Connect
      const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { sub: linkedinProfileId, name, email } = userInfoResponse.data;

      // ✅ Create or find user
      let user = await User.findOne({ linkedinProfileId });
      if (!user) {
        user = new User({
          name,
          email,
          linkedinProfileId,
          defaultCurrency: 'USD',
        });
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
      return done(error, null);
    }
  }
));

// Passport session serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ===== Controller Methods =====

// Start LinkedIn login
exports.linkedinLogin = passport.authenticate('linkedin');

// Handle LinkedIn callback
exports.linkedinCallback = (req, res, next) => {
  passport.authenticate('linkedin', async (err, user) => {
    if (err || !user) {
      console.error('Callback Auth Error:', err);
      return res.redirect('http://localhost:5173/myapp/web'); // Redirect to login/fail page
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login Error:', err);
        return res.redirect('http://localhost:5173/myapp/web');
      }

      // ✅ Redirect to frontend dashboard after login
      return res.redirect('http://localhost:5173/dashboard');
    });
  })(req, res, next);
};

// Handle logout
exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};
