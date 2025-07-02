const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const { Kyc } = require('../models/kyc.model');
const { Account } = require('../models/account.model');
const { Referal } = require('../models/referal.model');
const { addNotification } = require("../middlewares/notification.middleware");
const { sendMail } = require('../middlewares/mail.middleware');
const ejs = require('ejs');
const path = require('path');

const createNewUser = async ({ name, email, authProvider }) => {
  const country = "US";
  const password = Math.random().toString(36).slice(-8);
  const currencyDefault = "USD";

  const user = await User.create({
    name,
    email,
    password,
    country,
    defaultCurrency: currencyDefault,
    referalCode: "",
  });

  await Kyc.create({
    user: user._id,
    email,
    primaryPhoneNumber: 0,
    secondaryPhoneNumber: 0,
    documentType: '',
    documentNumber: '',
    addressDocumentType: '',
    documentPhotoFront: '',
    documentPhotoBack: '',
    addressProofPhoto: '',
    status: "Pending",
  });

  const GetAccountDetails = await Account.find({});
  let accountNumber, ifsc;
  if (GetAccountDetails.length > 0) {
    const last = GetAccountDetails[GetAccountDetails.length - 1];
    const lastVal = last.iban.substring(2);
    accountNumber = currencyDefault.substring(0, 2) + (parseFloat(lastVal) + 1);
    ifsc = parseInt(last.bic_code) + 1;
  } else {
    accountNumber = currencyDefault.substring(0, 2) + 1000000001;
    ifsc = 200001;
  }

  await Account.create({
    user: user._id,
    name: `${currencyDefault} account`,
    iban: accountNumber,
    ibanText: currencyDefault.substring(0, 2) + accountNumber,
    bic_code: ifsc,
    country: currencyDefault.substring(0, 2),
    currency: currencyDefault,
    defaultAccount: true,
    status: true,
  });

  await addNotification(user, `${authProvider} Signup: ${name}`, `${authProvider} Auth User`, `New user signed up via ${authProvider}`, "user", "newuser", "", `${authProvider} login`);

  const htmlBody = await ejs.renderFile(path.join(__dirname, '../views/UserDetails.ejs'), {
    name,
    email,
    password,
    urlLink: `${process.env.BASE_URL2}/myapp/web`,
  });

  if (htmlBody) {
    await sendMail(email, "Your Login Credentials", htmlBody);
  }

  return user;
};

// 🔵 Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    if (!user) {
      const name = profile.displayName || profile.name.givenName;
      user = await createNewUser({ name, email, authProvider: 'Google' });
    }
    done(null, user);
  } catch (err) {
    console.log("Google Auth Error:", err);
    done(err, null);
  }
}));

// 🟦 LinkedIn OAuth Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL,
  scope: ['r_liteprofile', 'r_emailaddress'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    if (!user) {
      const name = profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`;
      user = await createNewUser({ name, email, authProvider: 'LinkedIn' });
    }
    done(null, user);
  } catch (err) {
    console.log("LinkedIn Auth Error:", err);
    done(err, null);
  }
}));

// 🔐 Serialize/Deserialize for session handling
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id).select('-password');
  done(null, user);
});

// 🔄 Common Callback Handler
const handleOAuthRedirect = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.redirect('/login');

    const token = jwt.sign({
      expiresIn: '1d',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        defaultcurr: user.defaultCurrency,
      }
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.redirect(`http://localhost:5173/myapp/web?token=${token}`);
  } catch (err) {
    console.error("OAuth Callback Error:", err);
    res.redirect('/login');
  }
};

module.exports = {
  googleCallbackHandler: handleOAuthRedirect,
  linkedinCallbackHandler: handleOAuthRedirect,
};
