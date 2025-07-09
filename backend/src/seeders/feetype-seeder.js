const mongoose = require("mongoose");
require('dotenv').config();
const { FeeType } = require('../models/Admin/feetype.model');
const mongoURI = process.env.MONGO_DB_URI;
async function seedFeeType() {
    // check if fee type have data or not

    const DataArray = [
        {
            description: "Credit",
            title: "Credit",
            slug: "Credit",
            status: "active"
        },
        {
            description: "Debit",
            title: "Debit",
            slug: "Debit",
            status: "active"
        },
        {
            description: "Exchange",
            title: "Exchange",
            slug: "Exchange",
            status: "active"
        },
        {
            description: "Crypto Buy",
            title: "Crypto Buy",
            slug: "Crypto_Buy",
            status: "active"
        },
        {
            description: "Crypto Sell",
            title: "Crypto Sell",
            slug: "Crypto_Sell",
            status: "active"
        },
        {
            description: "Swap",
            title: "Swap",
            slug: "Swap",
            status: "active"
        },
        {
            description: "Deposit",
            title: "Deposit",
            slug: "Deposit",
            status: "active"
        },
    ]

     // Connect to the database
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existsData = await FeeType.find({});

    if(existsData.length == 0) {

        for (const item of DataArray) {
          await FeeType.create({description:item?.description, title: item?.title,slug: item?.slug,status: item?.status});
        }
        
        console.log("Fee type is created successfully");

    }  else {
        console.log("Data is already exists");
    }   
}

// Execute the admin seeder
seedFeeType().then(() => {
  console.log("Fee type seeding completed");
  process.exit(0);
}).catch((err) => {
  console.error("Error seeding fee type:", err);
  process.exit(1);
});