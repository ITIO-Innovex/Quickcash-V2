const ejs = require("ejs");
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { mongoose } = require("mongoose");
const { Kyc } = require("../models/kyc.model");
const { User } = require('../models/user.model');
const { States } = require("../models/states.model");
const { Cities } = require("../models/cities.model");
const { Referal } = require('../models/referal.model');
const { Account } = require('../models/account.model');
const { Currency } = require('../models/currency.model');
const { Countries } = require("../models/country.model");
const { sendMail } = require('../middlewares/mail.middleware');
const { ReferalUser } = require("../models/referaluser.model");
const { addNotification } = require("../middlewares/notification.middleware");

module.exports = {
  // This function is used for register new account of user
  registerUser: async (req, res) => {
    const { name, email, password, country, currency, referalCode, source } = req.body;
    try {
      if (name == "" || email == "" || password == "" || country == "") {
        return res.status(401).json({
          status: 401,
          message: "Name , Email Password and Country are mandatory",
          data: null
        })
      }

      const UserExists = await User.findOne({ email });

      if (UserExists) {
        return res.status(401).json({
          status: 401,
          message: "User with this email id is already registered with Us",
          data: null
        });
      }

      const defaultCurrency = await Currency.find({ defaultc: true });

      var currencyDefault = '';
      if (defaultCurrency?.length == 0) {
        currencyDefault = "USD"
      } else {
        currencyDefault = defaultCurrency?.[0]?.base_code
      }

      const user = await User.create({
        name,
        email,
        password,
        country: currencyDefault.substring(0, 2),
        defaultCurrency: currencyDefault,
        referalCode
      });

      if (!user) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting or creating data",
          data: null
        });
      }

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
        status: "Pending"
      });

      const createdUser = await User.findById({ _id: user._id }).select("-password");

      if (!createdUser) {
        return res.status(401).json({
          status: 401,
          message: "User with this email id is already registered with Us",
          data: null
        });
      }

      await addNotification(user, title = `${name} User has been registered`, tags = `Register User, New User, ${name}`, message = "New User has been registered", notifyFrom = "user", notifyType = "newuser", attachment = "", info = `${name} User has been registered`)

      if (referalCode) {
        const referredUser = await Referal.findOne({ referral_code: referalCode })
        await ReferalUser.create({
          user: user._id,
          referedByUser: referredUser?.user,
          referral_code: referalCode
        });
      }

      const GetAccountDetails = await Account.find({});
      var accountNumber = 0;
      var ifsc = 0;
      if (GetAccountDetails?.length > 0) {
        var checkacc = GetAccountDetails?.[GetAccountDetails?.length - 1]?.iban;
        var vall = checkacc.substring(2, checkacc.length);
        accountNumber = currencyDefault.substring(0, 2) + (parseFloat(vall) + parseFloat(1));
        ifsc = GetAccountDetails?.[GetAccountDetails?.length - 1]?.bic_code + 1;
      } else {
        accountNumber = currencyDefault.substring(0, 2) + (1000000001);
        ifsc = 200001;
      }

      await Account.create({
        user: user._id,
        name: currencyDefault + " " + "account",
        iban: accountNumber,
        ibanText: currencyDefault.substring(0, 2) + accountNumber,
        bic_code: ifsc,
        country: currencyDefault.substring(0, 2),
        currency: currencyDefault,
        defaultAccount: true,
        status: true
      });

      const getRates = await Currency.findOne({ base_code: currencyDefault });

      if (!getRates) {
        const requestOptions = {
          method: "GET",
          redirect: "follow"
        };

        const addedCurrency = await fetch(`https://v6.exchangerate-api.com/v6/1f7c99d1918ed4703f0367a4/latest/${currencyDefault}`, requestOptions)
        const response = await addedCurrency.json();
        const result = await JSON.stringify(response);
        if (result) {
          const val = JSON.parse(result);
          await Currency.create({
            base_code: val.base_code,
            currencyName: val.base_code,
            time_last_update_unix: val.time_last_update_unix,
            result: val.result,
            time_last_update_words: val.time_last_update_utc,
            conversion_rates: val.conversion_rates,
            status: true
          })
        }
      }

      const generateToken = user.generateAccessToken();
      const options = {
        httpOnly: true,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }

      const htmlBody = await ejs.renderFile(__dirname.replace('\controllers', '') + "/views/UserDetails.ejs", { name, email, password, urlLink: `${process.env.BASE_URL2}/myapp/web` });

      if (htmlBody) {
        const subject = "Login Credentials!!!"
        sendMail(email, subject, htmlBody);
        return res.cookie('accessToken', generateToken, options).status(200).json({
          status: 201,
          message: "User is registered Successfully!!!",
          ...(!source ? { data: createdUser } : ''),
          token: generateToken
        });
      }

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      })
    }
  },
  // Account delete request by users.
  deleteAccountRequest: async (req, res) => {
    try {
      const { id } = req.body;
      const addDeleteRequest = await User.findByIdAndUpdate(
        {
          _id: id
        },
        {
          deleteRequest: true
        },
        {
          new: true,
        })

      if (!addDeleteRequest) {
        return res.status(401).json({
          status: 401,
          message: "Error while adding delete request!",
          data: null
        })
      }
      return res.status(201).json({
        status: 201,
        message: "Delete request added successfully!"
      })
    } catch (error) {
      console.log("Error", error);
      return res.status(401).json({
        status: 401,
        message: error,
        data: null
      })
    }
  },
  // This function is used for fetching current logged in user details / verify details
  auth: async (req, res) => {
    try {

      const ObjectId = mongoose.Types.ObjectId;
      const details = await User.aggregate([
        {
          $match:
          {
            _id: new ObjectId(req?.user?._id)
          }
        },
        {
          $lookup: {
            "from": "referals",
            "localField": "_id",
            "foreignField": "user",
            "as": "referalDetails"
          }
        },
        {
          $lookup: {
            "from": "accounts",
            "localField": "_id",
            "foreignField": "user",
            "as": "accountDetails"
          }
        },
        {
          $lookup: {
            "from": "kycs",
            "localField": "_id",
            "foreignField": "user",
            "as": "kycDetails"
          }
        },
        {
          $addFields: {
            countryInt: { $toInt: "$country" },
            stateInt: { $toInt: "$state" },
            cityInt: { $toInt: "$city" }
          }
        },
        {
          $lookup: {
            from: "countries", // Your collection name (plural)
            localField: "countryInt",
            foreignField: "id",
            as: "countryData"
          }
        },
        {
          $lookup: {
            from: "states",
            localField: "stateInt",
            foreignField: "id",
            as: "stateData"
          }
        },
        {
          $lookup: {
            from: "cities",
            localField: "cityInt",
            foreignField: "id",
            as: "cityData"
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            mobile: 1,
            address: 1,
            gender: 1,
            // city: 1,
            // state: 1,
            // country: 1,
            defaultCurrency: 1,
            status: 1,
            postalcode: 1,
            ownerTitle: 1,
            ownertaxid: 1,
            owneridofindividual: 1,
            ownerbrd: 1,
            vaultAccountId: 1,
            resetToken: 1,
            referalCode: 1,
            ownerProfile: 1,
            createdAt: 1,
            country: { $arrayElemAt: ["$countryData", 0] },
            state: { $arrayElemAt: ["$stateData", 0] },
            city: { $arrayElemAt: ["$cityData", 0] },
            referalDetails: {
              _id: 1,
              referral_code: 1,
              status: 1,
            },
            accountDetails: {
              _id: 1,
              name: 1,
              bic_code: 1,
              iban: 1,
              currency: 1,
              country: 1,
              amount: 1,
              status: 1
            },
            kycDetails: {
              primaryPhoneNumber: 1,
              secondaryPhoneNumber: 1,
              email: 1,
              documentType: 1,
              documentNumber: 1,
              documentPhotoFront: 1,
              documentPhotoBack: 1,
              addressDocumentType: 1,
              addressProofPhoto: 1,
              status: 1
            }
          }
        }
      ])

      if (!details) {
        return res.status(401).json({
          status: 401,
          message: "User is not authorized to access page",
          data: null
        });
      }

      return res.status(201).json({
        status: 201,
        message: "User is Successfully authenticated",
        data: details[0]
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      });
    }

  },
  // This function is used for login user by verigy their enter credentials
  loginUser: async (req, res) => {

    const { email, password, source } = req.body;
    try {
      if (email == "" || password == "") {
        return res.status(401).json({
          status: 401,
          message: "Email and Password fields are mandatory",
          data: null
        })
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          status: 401,
          message: "User is not exists with Us! Please check your Email Id",
          data: null
        })
      }

      if (user?.suspend) {
        return res.status(401).json({
          status: 401,
          message: "Your Account has been suspended , please contact to the Admin",
          data: null
        })
      }

      if (!await user.isPasswordCorrect(password)) {
        return res.status(401).json({
          status: 401,
          message: "Invalid Credentials!!!",
          data: null
        })
      }

      const isPasswdCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswdCorrect) {
        return res.status(401).json({
          status: 401,
          message: "Invalid Credentials!!!",
          data: null
        })
      }

      const generateToken = await generateAccessTokenUser(user);

      const options = {
        httpOnly: true,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }

      const LoggedInData = await User.findById(user._id).select("-password");

      //await addNotification(user,title=`Login ${req?.user?.name} `,tags=`Invoice, ${req?.user?.name}`,message="New Invoice has been added",notifyFrom="admin",notifyType="invoice",attachment="",info=`New Invoice has been generated by the ${req?.user?.name} `);

      return res.cookie('accessToken', generateToken, options).status(200).json({
        status: 201,
        message: "User is logged In Successfully",
        user_id: user._id,
        ...(!source ? { data: LoggedInData } : ''),
        token: generateToken,
        type: 'user'
      });

    } catch (error) {
      console.log("Error", error);
      return res.status(401).json({
        status: 401,
        message: "Something Went Wrong With the Login API!!!",
        data: null
      })
    }
  },
  // This function is used for Logout user
  logoutUser: async (req, res) => {

    const options = {
      httpOnly: true,
      data: null,
      maxAge: 0
    }

    res.cookie('accessToken', '', options).status(201).json({
      status: 201,
      message: "User is logout Successfully",
      data: null,
      token: null
    });

  },
  // This function is used for update User Info by their Id
  updateUserInfo: async (req, res) => {
    let Image1 = "";
    if (req.files?.ownerbrd) {
      Image1 = req.files.ownerbrd[0].filename;
    }

    let Image2 = "";
    if (req.files?.ownerProfile) {
      Image2 = req.files.ownerProfile[0].filename;
    }

    try {
      const {
        name,
        mobile,
        state,
        email,
        city,
        country,
        gender,
        address,
        defaultCurrency,
        postalcode,
        ownerTitle,
        ownertaxid,
        owneridofindividual,
        status
      } = req.body;

      // Always use req.user._id for security
      const userId = req.user._id;

      if (!userId) {
        return res.status(401).json({
          status: 401,
          message: "Token is missing / Can't authenticate the right user",
          data: null
        })
      }

      if (Image1) {
        await User.findByIdAndUpdate(
          {
            _id: userId
          },
          {
            ownerbrd: Image1
          },
          {
            new: true,
          })
      }

      if (Image2) {
        await User.findByIdAndUpdate(
          {
            _id: userId
          },
          {
            ownerProfile: Image2
          },
          {
            new: true,
          })
      }

      const updateFields = {
        name,
        mobile,
        state,
        city,
        country,
        gender,
        address,
        defaultCurrency,
        email,
        postalcode,
        ownerTitle,
        ownertaxid,
        owneridofindividual,
        status
      };

      // Remove undefined fields
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });

      const UpdateProfile = await User.findByIdAndUpdate(
        {
          _id: userId
        },
        updateFields,
        {
          new: true,
        })

      if (!UpdateProfile) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating profile!",
          data: null
        })
      }

      // Construct full image URL if needed
      let ownerProfileUrl = UpdateProfile.ownerProfile;
      if (ownerProfileUrl && !ownerProfileUrl.startsWith('http')) {
        ownerProfileUrl = `${process.env.BASE_URL || ''}/storage/profile/${userId}/${ownerProfileUrl}`;
      }
      const updatedUserObj = {
        ...UpdateProfile.toObject(),
        ownerProfile: ownerProfileUrl
      };

      return res.status(201).json({
        status: 201,
        message: "User profile is updated successfully",
        data: updatedUserObj
      })
    } catch (error) {
      console.log("Error", error);
      return res.status(401).json({
        status: 401,
        message: error,
        data: null
      })
    }
  },
  // This function is used for change password by user id
  changePassword: async (req, res) => {
    try {

      const { new_passsword, confirm_password } = req.body;

      const userId = req?.user._id;

      if (new_passsword == "" || confirm_password == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory!!!",
          data: null
        })
      }

      if (!userId) {
        return res.status(401).json({
          status: 401,
          message: "Token is missing / Can't authenticate the right user",
          data: null
        })
      }

      const UpdatePassword = await User.findByIdAndUpdate(
        {
          _id: req.user._id
        },
        {
          password: await bcrypt.hash(confirm_password, 10)
        },
        {
          new: true,
        })

      if (!UpdatePassword) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating password!",
          data: null
        })
      }

      return res.status(201).json({
        status: 201,
        message: "User Password is updated successfully"
      })
    } catch (error) {
      console.log("Error", error);
      return res.status(401).json({
        status: 401,
        message: error,
        data: null
      })
    }
  },
  changePin: async (req, res) => {
    try {

      const { new_pin, confirm_pin, otp } = req.body;

      if (new_pin == "" || confirm_pin == "" || otp == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory!!!",
          data: null
        })
      }

      const userId = req?.user._id;

      if (!userId) {
        return res.status(401).json({
          status: 401,
          message: "Token is missing / Can't authenticate the user",
          data: null
        })
      }

      const UpdatePin = await User.findByIdAndUpdate(
        {
          _id: req.user._id
        },
        {
          pin: new_pin
        },
        {
          new: true,
        })

      if (!UpdatePin) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating pin!",
          data: null
        })
      }

      return res.status(201).json({
        status: 201,
        message: "User Pin is updated successfully"
      })
    } catch (error) {
      console.log("Error", error);
      return res.status(401).json({
        status: 401,
        message: error,
        data: null
      })
    }
  },
  // This function is used for fetch current user details
  currentuser: async (req, res) => {
    try {

      const userdetails = req.user;
      if (!userdetails) {
        return res.status(401).json({
          status: 401,
          message: "Invalid token"
        })
      }

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: req.user
      })
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      })
    }
  },
  // This function will return current loggedin user profile picture/image
  currentuserprofilephoto: async (req, res) => {
    try {

      const ObjectId = mongoose.Types.ObjectId;

      const userDetails = await User.findOne({ _id: new ObjectId(req?.user?._id) }).select("ownerProfile");

      if (!userDetails) {
        return res.status(401).json({
          status: 401,
          message: "Invalid token"
        })
      }

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: userDetails?.ownerProfile
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      })
    }
  },
  // This function is used for fetch user list
  listUsers: async (req, res) => {
    try {

      const dataDetails = await User.find({});
      if (!dataDetails) {
        return res.status(401).json({
          status: 401,
          message: "Invalid token"
        })
      }

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: dataDetails
      })
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      })
    }
  },
  // This function is used for forget password of user mobile endpoint
  forgetPasswordMobile: async (req, res) => {

    const { email } = req.body;
    const emailExists = await User.find({ email });

    if (emailExists.length == 0) {
      return res.status(401).json({
        status: 401,
        message: "Email is not exists in our record!!!",
        data: null
      })
    }

    const newtoken = await bcrypt.hash(email, 10);

    const InserttokenIntoDb = await User.findOneAndUpdate(
      {
        email: email
      },
      {
        resetToken: newtoken
      },
      {
        new: true,
      })

    // const htmlBody = await ejs.renderFile(__dirname.replace('\controllers','') + "/views/ResetPassword.ejs", { urlLink: `${process.env.LIVE_BASE_URL}reset-password/${newtoken}` });
    // const htmlBody = `<p>Click the following link to reset your password:</p><p><button type="button" style="background: 'green', padding: '10px 10px', color: 'white', cursor: 'pointer'"><a href="${process.env.BASE_URL}reset-password/${newtoken}">Click here</a></button></p>`
    // const subject = "Reset Password!!!"
    return res.status(201).json({
      status: 201,
      message: "Success",
      token: newtoken,
      data: true
    })
  },
  // This function is used for forget password of user
  forgetPassword: async (req, res) => {

    const { email } = req.body;
    const emailExists = await User.find({ email });

    if (emailExists.length == 0) {
      return res.status(401).json({
        status: 401,
        message: "Email is not exists in our record!!!",
        data: null
      })
    }

    const newtoken = await bcrypt.hash(email, 10);

    const InserttokenIntoDb = await User.findOneAndUpdate(
      {
        email: email
      },
      {
        resetToken: newtoken
      },
      {
        new: true,
      })

    const htmlBody = await ejs.renderFile(__dirname.replace('\controllers', '') + "/views/ResetPassword.ejs", { urlLink: `${process.env.LIVE_BASE_URL}reset-password/${newtoken}` });
    // const htmlBody = `<p>Click the following link to reset your password:</p><p><button type="button" style="background: 'green', padding: '10px 10px', color: 'white', cursor: 'pointer'"><a href="${process.env.BASE_URL}reset-password/${newtoken}">Click here</a></button></p>`
    if (htmlBody) {
      const subject = "Reset Password!!!"
      sendMail(email, subject, htmlBody);
      return res.status(201).json({
        status: 201,
        message: "Success",
        data: true
      })
    }
  },
  // This function is used for reset password
  resetPassword: async (req, res) => {

    const { token, password } = req.body;

    if (token == "" || password == "") {
      return res.status(401).json({
        status: 401,
        message: "All fields are mandatory!!",
        data: null
      })
    }

    const tokenExists = await User.find({ resetToken: token });

    if (tokenExists.length == 0) {
      return res.status(401).json({
        status: 401,
        message: "Invalid Token , Make sure you have a correct reset password link / Reset Link Expired",
        data: null
      })
    }

    const UpdatePassword = await User.findOneAndUpdate(
      {
        resetToken: token
      },
      {
        password: await bcrypt.hash(password, 10)
      },
      {
        new: true,
      })

    if (!UpdatePassword) {
      return res.status(401).json({
        status: 401,
        message: "Error while updating password!",
        data: null
      })
    }

    await User.findOneAndUpdate(
      {
        resetToken: token
      },
      {
        resetToken: null
      },
      {
        new: true,
      })

    return res.status(201).json({
      status: 201,
      message: "Password has been updated",
      data: null
    })
  },
  // This function is for update user status
  updateUserStatus: async (req, res) => {
    const { user, status } = req.body;

    try {
      if (user == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        })
      }

      const Updatetax = await User.findByIdAndUpdate(
        {
          _id: user
        },
        {
          user,
          status
        },
        {
          new: true,
        })

      if (!Updatetax) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating tax data",
          data: null
        })
      }

      return res.status(200).json({
        status: 201,
        message: "User Status has been saved !!!",
        data: Updatetax
      })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      })
    }
  },
  // This function is for update user suspend
  updateUserSuspend: async (req, res) => {
    const { user, suspend } = req.body;

    try {
      if (user == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        })
      }

      const UpdateSuspend = await User.findByIdAndUpdate(
        {
          _id: user
        },
        {
          user,
          suspend
        },
        {
          new: true,
        })

      if (!UpdateSuspend) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating data",
          data: null
        })
      }

      return res.status(200).json({
        status: 201,
        message: "User Suspend Status has been saved !!!",
        data: UpdateSuspend
      })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      })
    }
  },
  // This function is for send otp to their user registered email address
  sendOtpEmail: async (req, res) => {
    try {
      const { email, name } = req.body;
      if (email == '' || name == '') {
        return res.status(400).json({
          status: 400,
          message: `Email / Name is missing`,
          data: null
        })
      }

      const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
      const htmlBody = await ejs.renderFile(__dirname.replace('\controllers', '') + "/views/OtpMail.ejs", { otp: otp, name: name });
      if (htmlBody) {
        const subject = "OTP for Password Update"
        sendMail(email, subject, htmlBody);

        // Store OTP in user record (with expiry if you want)
        await User.findOneAndUpdate(
          { email: email.trim().toLowerCase() },
          { otp: otp, otpCreatedAt: new Date() }
        );

        return res.status(201).json({
          status: 201,
          message: `OTP has been sent on Registered Email ID: ${email}`,
          data: true
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      });
    }
  },
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          status: 400,
          message: "Email and OTP are required",
          data: null
        });
      }

      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
          data: null
        });
      }

      // Optional: Check OTP expiry (e.g., 10 min)
      // const now = new Date();
      // if (user.otpCreatedAt && (now - user.otpCreatedAt) > 10 * 60 * 1000) {
      //   return res.status(400).json({ status: 400, message: "OTP expired", data: null });
      // }

      if (user.otp && user.otp.toString() === otp.toString()) {
        // Optionally clear OTP after successful verification
        await User.findOneAndUpdate({ email: email.trim().toLowerCase() }, { $unset: { otp: "", otpCreatedAt: "" } });
        return res.status(200).json({
          status: 200,
          message: "OTP verified successfully",
          data: true
        });
      } else {
        return res.status(400).json({
          status: 400,
          message: "Invalid OTP",
          data: null
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      });
    }
  },
  // This function is used for get country list details
  getCountryList: async (req, res) => {
    try {

      const countryResult = await Countries.find({});
      const stateResult = await States.find({});

      if (!countryResult) {
        console.log(result);
        return res.status(500).json({
          status: 500,
          message: "getting error while fetching country list",
          data: null
        })
      };

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: {
          "country": countryResult,
          "states": stateResult
        }
      })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      });
    }
  },
  // This function is used for fetching state list
  getStateList: async (req, res) => {
    try {
      const country_id = req.params.id;

      if (!country_id) {
        return res.status(500).json({
          status: 500,
          message: "Country Id is missing",
          data: null
        })
      }

      const result = await States.find({ country_name: country_id });
      if (!result) {
        console.log(result);
        return res.status(500).json({
          status: 500,
          message: "getting error while fetching states list",
          data: null
        })
      };

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: result
      })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      });
    }
  },
  // This function is used for get city list details
  getCityLists: async (req, res) => {
    try {
      const state_id = req.params.id;

      if (!state_id) {
        return res.status(500).json({
          status: 500,
          message: "State Id is missing",
          data: null
        })
      }
      const result = await Cities.find({ state_name: state_id });
      if (!result) {
        console.log(result);
        return res.status(500).json({
          status: 500,
          message: "getting error while fetching state list",
          data: null
        })
      };

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: result
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: null
      });
    }
  },
  // This function is used for get recent trades details (Mobile API)
  getRecentTrades: async (req, res) => {
    try {

      console.log("Hello");

      const coin = "BTCUSDT";

      const resultTrade = await axios.get(`https://api.binance.com/api/v3/trades?symbol=${coin}&limit=14`);

      if (!resultTrade?.data) {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong with binance api",
          data: null
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: resultTrade?.data
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with binance api",
        data: null
      });
    }
  },
  // This function is used for get live crypto market details (Mobile API)
  getLiveMarketCryptoCoinData: async (req, res) => {

    try {

      const response = await axios.get("https://api.binance.com/api/v3/ticker?symbols=[%22BTCUSDT%22,%22BNBUSDT%22,%22DOGEUSDT%22,%22ADAUSDT%22,%22SOLUSDT%22,%22LTCUSDT%22,%22ETHUSDT%22,%22SHIBUSDT%22]");

      if (!response?.data) {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong with binance api",
          data: null
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: response?.data
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with binance api",
        data: null
      });
    }

  },

  generateAccessTokenUser: generateAccessTokenUser
}

// This Convert the number into stars in order to hide number to users
function convertNumberWithStar(val) {
  const arr = val.split('');
  let valArr = '';
  arr.forEach((element, index) => {
    if (index == 2 || index == 5 || index == 6 || index > 8 || index == 9) {
      valArr += '*';
    } else {
      valArr += element;
    }
  });
  return valArr;
}

// This function will generate the Access token
async function generateAccessTokenUser(user) {
  const dataSend = {
    id: user._id,
    email: user.email,
    name: user.name,
    type: 'user',
    defaultcurr: user.defaultCurrency
  }

  try {
    return jwt.sign({
      expiresIn: '12h',
      exp: Math.floor(Date.now() / 1000) + (43200),
      data: dataSend
    }, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    console.log("Error while generating Access Token", error);
  }
}