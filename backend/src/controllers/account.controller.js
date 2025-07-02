const { mongoose } = require("mongoose");
const { User } = require("../models/user.model");
const { Account } = require("../models/account.model");
const { Currency } = require("../models/currency.model");
const { Transaction } = require("../models/transaction.model");
const {Card} = require("../models/cards.model")
const { addNotification } = require("../middlewares/notification.middleware");

module.exports = {
  // This function is for add account details in the table
  addAccount: async (req, res) => {
    const { user, currency } = req.body;
    const ObjectId = mongoose.Types.ObjectId;

    try {
      if (!currency || !user) {
        return res.status(401).json({
          status: 401,
          message: "Currency and User are mandatory",
          data: null,
        });
      }

      // Check if currency exists in records
      const currencyExistsInOurRecord = await Currency.findOne({
        base_code: currency,
      });
      if (!currencyExistsInOurRecord) {
        return res.status(401).json({
          status: 401,
          message: `You are not allowed to create account in ${currency}`,
          data: null,
        });
      }

      // Check if account already exists
      const AccountExists = await Account.findOne({
        currency,
        user: new ObjectId(user),
      });
      if (AccountExists) {
        return res.status(401).json({
          status: 401,
          message: "An account with this currency already exists",
          data: null,
        });
      }

      // Generate IBAN, BIC Code, Country Code
      const GetAccountDetails = await Account.find({});
      let accountNumber = 0;
      let ifsc = 0;

      if (GetAccountDetails.length > 0) {
        const lastIban = GetAccountDetails[GetAccountDetails.length - 1].iban;
        const numberPart = lastIban.substring(2, lastIban.length);
        accountNumber = currency.substring(0, 2) + (parseInt(numberPart) + 1);
        ifsc = GetAccountDetails[GetAccountDetails.length - 1].bic_code + 1;
      } else {
        accountNumber = currency.substring(0, 2) + "1000000001";
        ifsc = 200001;
      }

      // ✅ Create Account
      const account = await Account.create({
        user,
        name: currency,
        iban: accountNumber,
        ibanText: currency.substring(0, 2) + accountNumber,
        bic_code: ifsc,
        country: currency.substring(0, 2),
        currency,
        status: true,
      });

      if (!account) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting account data",
          data: null,
        });
      }

      // ✅ Auto-create Card with Account Details
      const cardExists = await Card.findOne({
        currency,
        user: new ObjectId(user),
      });

      if (!cardExists) {
        const card = await Card.create({
          user,
          Account: account._id, // Linking Account ID
          name: currency + " Card",
          cardNumber: Math.floor(Math.random() * 9999999999999999).toString(),
          cvv: "123",
          expiry: "12/30",
          status: true,
          currency,
          cardType: "Debit",
          amount: "0",
          paymentType: "Online",
          iban: account.iban, // ✅ Copying IBAN from Account
          country: account.country, // ✅ Copying Country from Account
          bic_code: account.bic_code, // ✅ Copying BIC Code from Account
        });

        if (!card) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting card data",
            data: null,
          });
        }
      }

      return res.status(200).json({
        status: 201,
        message: "Account and Card created successfully!",
        data: account,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with the API",
        data: error,
      });
    }
  },
  // This function is for fetch list account detils from the account table
  accountList: async (req, res) => {
    const user_id = req.params.id;
    const title = req.query.title || "";
    const ObjectId = mongoose.Types.ObjectId;

    try {
      if (!user_id) {
        return res.status(402).json({
          status: 402,
          message: "User Id is missing",
          data: null,
        });
      }

      const defaultAcctCurr = await User.find({ _id: user_id });

      const totalTransactions = await Transaction.find({
        user: user_id,
      });

      const totalAmount = await Account.find({
        user: user_id,
      });

      let defaultAccountAmt = "";
      var totalAmounts = 0;
      if (totalAmount) {
        for (results of totalAmount) {
          if (results.currency == defaultAcctCurr[0].defaultCurrency) {
            defaultAccountAmt = results.amount;
          } else {
            let amty = await convertAmtintoDefaultCurrency(
              results.currency,
              defaultAcctCurr[0].defaultCurrency,
              results.amount
            );
            if (amty) {
              totalAmounts = totalAmounts + amty;
            }
          }
        }
      }

      const details = await Account.aggregate([
        {
          $match: {
            user: new ObjectId(user_id),
            $or: [{ name: { $regex: title, $options: "i" } }],
          },
        },
        {
          $lookup: {
            from: "transactions",
            localField: "_id",
            foreignField: "source_account",
            as: "transDetails",
          },
        },
      ]);

      if (!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching account list!!!",
          data: null,
          totalTransactions: null,
          totalAmt: null,
          currency: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Account list is Successfully fetched",
        data: details,
        totalTransactions: totalTransactions,
        totalAmt: totalAmounts + defaultAccountAmt,
        currency: defaultAcctCurr[0].defaultCurrency,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching account list!!!",
        data: error,
      });
    }
  },
  // This function is used for fetch account details by their account id
  accountById: async (req, res) => {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const accountId = req.params.id;
      if (!accountId) {
        return res.status(402).json({
          status: 402,
          message: "Account Id is missing",
          data: null,
        });
      }

      const details = await Account.findOne({ _id: new ObjectId(accountId) });

      if (!details) {
        console.log("details", details);
        return res.status(402).json({
          status: 402,
          message: "Account Id doesn't exists",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Account list is Successfully fetched",
        data: details,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error,
      });
    }
  },
  // This function is used for getting default account of logged in user
  defaultAccount: async (req, res) => {
    try {
      const user_id = req.params.id;

      if (!user_id) {
        return res.status(402).json({
          status: 402,
          message: "User Id is missing",
          data: null,
        });
      }

      const defaultCurrUser = await User.find({ _id: user_id });

      const ObjectId = mongoose.Types.ObjectId;
      const defaultDetails = await User.aggregate([
        {
          $match: {
            _id: new ObjectId(user_id),
          },
        },
        {
          $lookup: {
            from: "accounts",
            localField: "user",
            foreignField: "_id ",
            as: "accountDetails",
          },
        },
        {
          $addFields: {
            accountDetails: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$accountDetails",
                    as: "act",
                    cond: {
                      //"$eq": [ "$$act.currency", defaultCurrUser?.[0]?.defaultCurrency ]
                      $and: [
                        {
                          $in: [
                            "$$act.currency",
                            [defaultCurrUser?.[0]?.defaultCurrency],
                          ],
                        },
                        { $eq: ["$$act.user", defaultCurrUser?.[0]?._id] },
                      ],
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            country: 1,
            defaultCurrency: 1,
            email: 1,
            status: 1,
            name: 1,
            accountDetails: {
              _id: 1,
              name: 1,
              address: 1,
              country: 1,
              currency: 1,
              bankName: 1,
              defaultAccount: 1,
              iban: 1,
              ibanText: 1,
              bic_code: 1,
              amount: 1,
              status: 1,
            },
          },
        },
      ]);

      if (!defaultDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching account details!!!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Account list is Successfully fetched",
        data: defaultDetails,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error,
      });
    }
  },
  // This function is used for update name of account by their id
  changeName: async (req, res) => {
    try {
      const { name, user_id } = req.body;
      const ObjectId = mongoose.Types.ObjectId;
      if (name == "" || user_id == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory!!!",
          data: null,
        });
      }

      const UpdateName = await Account.findByIdAndUpdate(
        {
          _id: new ObjectId(user_id),
        },
        {
          name,
        },
        {
          new: true,
        }
      );

      if (!UpdateName) {
        console.log(UpdateName);
        return res.status(401).json({
          status: 401,
          message: "Error while updating name!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "User Account Name is updated successfully",
      });
    } catch (error) {
      console.log("Error", error);
      return res.status(401).json({
        status: 401,
        message: error,
        data: null,
      });
    }
  },
  // This function is used for update account details
  updateAccount: async (req, res) => {
    try {
      const { name, user_id } = req.body;
  
      if (!user_id) {
        return res.status(401).json({
          status: 401,
          message: "User ID is mandatory!",
          data: null
        });
      }
  
      const updatedAccount = await Account.findByIdAndUpdate(
        { _id: user_id },
        { name },
        { new: true }
      );
  
      if (!updatedAccount) {
        return res.status(401).json({
          status: 401,
          message: "Error updating account details!",
          data: null
        });
      }
  
      // ✅ Also update linked Card
      await Card.updateMany(
        { Account: updatedAccount._id },
        {
          iban: updatedAccount.iban,
          country: updatedAccount.country,
          bic_code: updatedAccount.bic_code
        }
      );
  
      return res.status(201).json({
        status: 201,
        message: "Account details updated successfully!"
      });
  
    } catch (error) {
      console.log("Error", error);
      return res.status(401).json({
        status: 401,
        message: error,
        data: null
      });
    }
  },
  // This function is used for fetch account details by user and account id
  accountByCurrency: async (req, res) => {
    try {
      const currency = req.params.id;
      if (!currency) {
        return res.status(402).json({
          status: 402,
          message: "Currency is missing",
          data: null,
        });
      }

      const details = await Account.findOne({
        user: req?.user?.id,
        currency: currency,
      });

      if (!details) {
        console.log(details);
        return res.status(402).json({
          status: 402,
          message: "Error while fetching account details!!!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Account list is Successfully fetched",
        data: details,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error,
      });
    }
  },
};

// This function is used for exchange one currency value to other currency
async function convertAmtintoDefaultCurrency(from, to, amt) {
  try {
    const details = await Currency.findOne({ base_code: from });

    if (details) {
      let date1 = new Date().toISOString().replace("T", " ").substring(0, 10);
      let date2 = details.createdAt
        .toISOString()
        .replace("T", " ")
        .substring(0, 10);

      if (date1 > date2) {
        const deletedResult = await Currency.findOneAndDelete({
          base_code: from,
        });

        if (deletedResult) {
          const requestOptions = {
            method: "GET",
            redirect: "follow",
          };

          const addedCurrency = await fetch(
            `https://v6.exchangerate-api.com/v6/1f7c99d1918ed4703f0367a4/latest/${from}`,
            requestOptions
          );
          const response = await addedCurrency.json();
          const result = await JSON.stringify(response);

          if (result) {
            const val = JSON.parse(result);
            const currency = await Currency.create({
              base_code: val.base_code,
              time_last_update_unix: val.time_last_update_unix,
              result: val.result,
              time_last_update_words: val.time_last_update_utc,
              conversion_rates: val.conversion_rates,
              status: true,
            });

            return amt * currency.conversion_rates[0][to];
          }
        }
      } else {
        return amt * details.conversion_rates[0][to];
      }
    } else {
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      const addedCurrency = await fetch(
        `https://v6.exchangerate-api.com/v6/1f7c99d1918ed4703f0367a4/latest/${from}`,
        requestOptions
      );
      const response = await addedCurrency.json();
      const result = await JSON.stringify(response);
      if (result) {
        const val = JSON.parse(result);
        const currency = await Currency.create({
          base_code: val.base_code,
          time_last_update_unix: val.time_last_update_unix,
          result: val.result,
          time_last_update_words: val.time_last_update_utc,
          conversion_rates: val.conversion_rates,
          status: true,
        });
        return amt * currency.conversion_rates[0][to];
      }
    }
  } catch (error) {
    console.error(error);
  }
}
