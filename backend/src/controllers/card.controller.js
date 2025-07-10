const { mongoose } = require("mongoose");
const { Card } = require("../models/cards.model");
const { Wallet } = require("../models/wallet.model");
const { Currency } = require("../models/currency.model");
const { User } = require("../models/user.model");
const { Account } = require("../models/account.model");
const { Transaction } = require("../models/transaction.model");
const axios = require("axios");

const getCurrencyConversion = async (fromCurrency, toCurrency, amount) => {
  try {
    const response = await axios.get(
      "https://currency-converter18.p.rapidapi.com/api/v1/convert",
      {
        params: {
          from: fromCurrency,
          to: toCurrency,
          amount: amount,
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "currency-converter18.p.rapidapi.com",
        },
      }
    );

    if (response.data.result) {
      return response.data.result.convertedAmount;
    } else {
      console.error("Currency conversion failed:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error in currency conversion:", error);
    return null;
  }
};

module.exports = {
  //This is used to update amount by wallat balance
  updateAmountById: async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
  
    try {
      if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
      }
  
      const card = await Card.findById(id);
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
  
      const userId = card.user;
      const account = await Account.findOne({ user: userId });
      if (!account) {
        return res.status(404).json({ message: `Account not found for user ${userId}` });
      }
  
      const previousAmount = account.amount || 0;
      const totalBalance = parseFloat(previousAmount) + parseFloat(amount);
  
      card.amount = totalBalance;
      await card.save();
  
      account.amount = totalBalance;
      await account.save();
  
      return res.status(200).json({
        status: 200,
        message: 'Amount updated successfully',
        previousAmount: previousAmount,
        newTotalBalance: totalBalance,
        card: card,
        account: account
      });
  
    } catch (error) {
      console.error('Error updating amount:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error updating the amount',
        error: error.message,
      });
    }
  },
  //This is used to set card limit
  updateCardLimit: async (req, res) => {
    const { dailyLimit, monthlyLimit } =
      req.body;
    const cardId = req.params.id;

    if (!dailyLimit || !monthlyLimit) {
      return res.status(400).json({
        status: 400,
        message: "Both dailyLimit and monthlyLimit are required!",
        data: null,
      });
    }

    try {
      const card = await Card.findById(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      card.dailyLimit = dailyLimit;
      card.monthlyLimit = monthlyLimit;

      await card.save();

      return res.status(200).json({
        status: 200,
        message: "Card limits and information updated successfully",
        data: card,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 500,
        message: "Error while updating card limits",
        data: error,
      });
    }
  },
  //This is used to freeze card when user click
  toggleFreezeCard: async (req, res) => {
    try {
      const cardId = req.params.id;
      const card = await Card.findById(cardId);

      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      card.isFrozen = !card.isFrozen;

      await card.save();

      const toggleData = {
        cardId: card._id,
        name: card.name,
        user: card.user,
        cardNumber: card.cardNumber,
        cvv: card.cvv,
        expiry: card.expiry,
        Account: card.Account,
        currency: card.currency,
        cardType: card.cardType,
        amount: card.amount,
        paymentType: card.paymentType,
        iban: card.iban,
        isFrozen: card.isFrozen,
      };

      return res.status(200).json({
        status: 201,
        message: card.isFrozen
          ? "Card frozen successfully"
          : "Card unfrozen successfully",
        data: toggleData,
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

  // This is used for add card details into the card table
  addCard: async (req, res) => {
    const ObjectId = mongoose.Types.ObjectId;
    const {
      name,
      user,
      cardnumber,
      cvv,
      expiry,
      Account,
      currency,
      cardType,
      amount,
      paymentType,
      iban,
    } = req.body; // Include cardType here
    console.log("All card data", req.body);
    try {
      if (name == "" || cardnumber == "" || cvv == "" || expiry == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null,
        });
      }

      console.log("card type", cardType);
      const CardExists = await Card.findOne({ cardnumber: cardnumber });
      console.log("Card Number", CardExists);

      if (CardExists) {
        return res.status(401).json({
          status: 401,
          message: "Card number is already added in our record",
          data: null,
        });
      }

      const CurrencyWithSameAccount = await Card.findOne({
        currency: currency,
        user: new ObjectId(user),
      });

      if (CurrencyWithSameAccount) {
        return res.status(401).json({
          status: 401,
          message: "Same Currency Account is already added in our record",
          data: null,
        });
      }

      const card = await Card.create({
        user,
        name,
        cardNumber: cardnumber,
        cvv,
        pin: Math.floor(Math.random() * 1000),
        expiry,
        status: true,
        Account,
        currency,
        cardType,
        amount,
        paymentType,
        iban,
      });

      if (!card) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting card data",
          data: null,
        });
      }

      return res.status(200).json({
        status: 201,
        message: "Card is added Successfully!!!",
        data: card,
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

  addMoney: async (req, res) => {
    const { user, cardNumber, amount, accountId, currency } = req.body;

    try {
      if (!cardNumber || !amount || !accountId || !currency) {
        return res.status(400).json({
          status: 400,
          message:
            "Card Number, Account ID, Currency, and Amount are mandatory fields.",
          data: null,
        });
      }

      const selectedAccount = await Account.findOne({
        _id: accountId,
        user: user,
      });

      if (!selectedAccount) {
        return res.status(400).json({
          status: 400,
          message: "Selected account not found.",
          data: null,
        });
      }

      let finalAmount = parseFloat(amount);
      if (selectedAccount.currency !== currency) {
        const conversionRate = await getCurrencyConversion(
          currency,
          selectedAccount.currency,
          finalAmount
        );

        if (!conversionRate) {
          return res.status(400).json({
            status: 400,
            message: "Currency conversion failed.",
            data: null,
          });
        }

        finalAmount = conversionRate;
      }

      // Ensure balance is checked BEFORE deducting amount
      if (parseFloat(selectedAccount.amount) < parseFloat(finalAmount)) {
        return res.status(400).json({
          status: 400,
          message: "Not sufficient balance in your account!",
          data: null,
        });
      }

      console.log("Sufficient balance. Proceeding with transaction...");

      // Deduct amount from selected account
      selectedAccount.amount = (
        parseFloat(selectedAccount.amount) - parseFloat(finalAmount)
      ).toFixed(2);
      await selectedAccount.save();

      // Find the selected card
      const existingCard = await Card.findOne({
        cardNumber: cardNumber,
        user: user,
      });

      if (!existingCard) {
        return res.status(400).json({
          status: 400,
          message: `No card found with Card Number ${cardNumber}`,
          data: null,
        });
      }

      // Add converted amount to the selected card
      existingCard.amount = (
        parseFloat(existingCard.amount) + finalAmount
      ).toFixed(2);
      await existingCard.save();

      // Generate a unique transaction number
      const trxNumber = Math.floor(Math.random() * 999999999999);
      console.log("trx number", trxNumber);

      await Transaction.create({
        user,
        source_account: accountId,
        transfer_account: existingCard._id,
        trx: trxNumber,
        amount: amount,
        postBalance: selectedAccount.amount,
        trans_type: "Add Money to Card",
        status: "Success",
        addedBy: user,
        amountText: `${amount} ${currency}`,
      });

      return res.status(201).json({
        status: 201,
        message: "Money added successfully!",
        data: {
          cardId: existingCard._id,
          cardNumber: existingCard.cardNumber,
          amount: existingCard.amount, // Returning correct amount
          accountId: selectedAccount._id,
          accountBalance: selectedAccount.amount,
        },
      });
    } catch (error) {
      console.error("Error in addMoney:", error);
      return res.status(500).json({
        status: 500,
        message: "Error adding money to the card.",
        data: error,
      });
    }
  },

  // This is used for add card details into the card table (Mobile API)
  addCardApi: async (req, res) => {
    const ObjectId = mongoose.Types.ObjectId;
    const { name, user, currency, cardType, amount, paymentType, iban } =
      req.body; // Include cardType here
    try {
      if (user == "") {
        return res.status(401).json({
          status: 401,
          message: "User Id is missing",
          data: null,
        });
      }

      if (name == "" || currency == "") {
        return res.status(401).json({
          status: 401,
          message: "Name,Currency fields are required",
          data: null,
        });
      }

      var valueGen = Math.floor(Math.random() * 9999999999999999);

      // Check if card number exists
      const CardExists = await Card.findOne({ cardNumber: valueGen });

      if (CardExists) {
        return res.status(401).json({
          status: 401,
          message: "Card number is already added in our record",
          data: null,
        });
      }

      // Check if the same currency exists
      const CurrencyWithSameAccount = await Card.findOne({
        currency: currency,
        user: new ObjectId(user),
      });

      if (CurrencyWithSameAccount) {
        return res.status(401).json({
          status: 401,
          message: "Same Currency Account is already added in our record",
          data: null,
        });
      }

      // Check if the requested currency exists in our currency list
      const currencyExistsInOurRecord = await Currency.findOne({
        base_code: currency,
      });

      if (!currencyExistsInOurRecord) {
        return res.status(401).json({
          status: 401,
          message: `You are not allowed to create card from ${currency} currency account`,
          data: null,
        });
      }

      const card = await Card.create({
        user,
        name,
        cardNumber: valueGen,
        cvv: "123",
        pin: Math.floor(Math.random() * 1000),
        expiry: "12/30",
        status: true,
        currency,
        cardType,
        amount,
        paymentType,
        iban,
      });

      if (!card) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting card data",
          data: null,
        });
      }

      return res.status(200).json({
        status: 201,
        message: "Card is added Successfully!!!",
        data: card,
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

  // This is used for fetching card details from the card table
  cardList: async (req, res) => {
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

      const cardDetails = await Card.find({ user: new ObjectId(user_id) });

      if (!cardDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching card list!!!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Card list is Successfully fetched",
        data: cardDetails,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching card list!!!",
        data: error,
      });
    }
  },
  // This is used for fetching card details by their card from the card table
  cardById: async (req, res) => {
    try {
      const card_id = req.params.id;
      if (!card_id) {
        return res.status(402).json({
          status: 402,
          message: "Card Id is missing",
          data: null,
        });
      }

      const details = await Card.findOne({ _id: card_id });

      if (!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching card details!!!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Card details is Successfully fetched",
        data: details,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error,
      });
    }
  },

  // This is used for update card details from the card table
  updateCard: async (req, res) => {
    try {
      const { status } = req.body;
      const card_id = req?.params?.id;
      console.log("updated card data", req.body);

      const UpdateData = await Card.findByIdAndUpdate(
        card_id,
        {
          status: status === "true" || status === true ? true : false,
        },
        { new: true }
      );

      if (!UpdateData) {
        console.log(UpdateData);
        return res.status(401).json({
          status: 401,
          message: "Error while updating card details!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "User Card details has been updated successfully",
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

  // This is used for update card details from the card table (Mobile API)
  updateCardApi: async (req, res) => {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const card_id = req?.params?.id;

      const { name, user_id, cvv, status } = req.body;

      if (name == "" || user_id == "" || cvv == "") {
        return res.status(401).json({
          status: 401,
          message: "All red star mark * fields are mandatory!!!",
          data: null,
        });
      }

      const UpdateData = await Card.findByIdAndUpdate(
        {
          _id: new ObjectId(card_id),
        },
        {
          user: user_id,
          name,
          cvv,
          status: status,
        },
        {
          new: true,
        }
      );

      if (!UpdateData) {
        console.log(UpdateData);
        return res.status(401).json({
          status: 401,
          message: "Error while updating card details!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "User Card details has been updated successfully",
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
  // This is used to change/update card pin
  changePin: async (req, res) => {
    const { pin, cardId } = req.body;
    if (pin == "" || cardId == "") {
      return res.status(401).json({
        status: 401,
        message: "Make sure Pin value has been filled!!!",
        data: null,
      });
    }

    try {
      const UpdateData = await Card.findByIdAndUpdate(
        {
          _id: cardId,
        },
        {
          pin,
        },
        {
          new: true,
        }
      );

      if (!UpdateData) {
        console.log(UpdateData);
        return res.status(401).json({
          status: 401,
          message: "Error while updating card pin!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "User Card Pin has been updated successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong!",
        data: null,
      });
    }
  },
  // This is used for delete card
  deleteCard: async (req, res) => {
    try {
      const card_id = req.params.id;

      if (card_id == "") {
        return res.status(401).json({
          status: 401,
          message: "Card Id is missing",
          data: null,
        });
      }

      const deletedData = await Card.deleteOne({ _id: card_id });
      console.log("deleted data sucessfully", deletedData);

      if (!deletedData) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating card details!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "User Card Data has been deleted successfully",
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

  // Load card balance with currency conversion, deduction, and transaction
  loadCardBalance: async (req, res) => {
    try {
      const {
        sourceAccountId, // Account to deduct from
        cardId,          // Card to credit
        amount,          // Amount in source currency
        fee,             // Fee in source currency
        conversionAmount, // Amount to add to card (in card currency)
        fromCurrency,
        toCurrency,
        info
      } = req.body;

      if (!sourceAccountId || !cardId || !amount || !conversionAmount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Find source account
      const account = await Account.findById(sourceAccountId);
      if (!account) {
        return res.status(404).json({ message: 'Source account not found' });
      }
      if (account.amount < (parseFloat(amount) + parseFloat(fee))) {
        return res.status(400).json({ message: 'Insufficient account balance' });
      }

      // Find card
      const card = await Card.findById(cardId);
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }

      // Deduct from account
      account.amount = parseFloat(account.amount) - (parseFloat(amount) + parseFloat(fee));
      await account.save();

      // Add to card
      card.amount = parseFloat(card.amount || 0) + parseFloat(conversionAmount);
      await card.save();

      // Create transaction (wallet to card)
      const trx = await Transaction.create({
        user: account.user,
        source_account: sourceAccountId,
        transfer_account: null, // Not another account, but card
        trx: Math.floor(Math.random() * 999999999999).toString(),
        info: info || 'Wallet to Card Balance Load',
        trans_type: 'Wallet To Card',
        tr_type: 'wallet-to-card',
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: amount,
        postBalance: account.amount,
        status: 'Complete',
        fee: fee,
        conversionAmount: conversionAmount,
        conversionAmountText: `${conversionAmount} ${toCurrency}`,
        amountText: `${amount} ${fromCurrency}`,
        dashboardAmount: amount,
        extraType: 'debit',
        addedBy: account.user,
      });

      return res.status(200).json({
        status: 200,
        message: 'Card loaded successfully',
        cardBalance: card.amount,
        accountBalance: account.amount,
        transaction: trx
      });
    } catch (error) {
      console.error('Error loading card balance:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error loading card balance',
        error: error.message,
      });
    }
  },
};
