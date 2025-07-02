const mongoose = require("mongoose");
require('dotenv').config();
const { Admin } = require("../models/Admin/admin.model");
const { FeeType } = require("../models/Admin/feetype.model");
const { FeeStructure } = require('../models/Admin/feestucture.model');
const mongoURI = process.env.MONGO_DB_URI;
async function seedFeeStructure() {

    // Connect to the database
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminId =  await Admin.findOne({superadmin: true}).select("-password");

    const feetype = await FeeType.find({});

    if(!adminId) {
        console.log("Admin is not exists!");
        return;
    }

    const DataArray = [
    {
      user: adminId?._id,
      type: feetype?.[0]?._id,
      commissionType: "percentage",
      value: 10,
      minimumValue: 10
    },
    {
      user: adminId?._id,
      type: feetype?.[1]?._id,
      commissionType: "percentage",
      value: 10,
      minimumValue: 10
    },
    {
      user: adminId?._id,
      type: feetype?.[2]?._id,
      commissionType: "percentage",
      value: 10,
      minimumValue: 10
    },
    {
      user: adminId?._id,
      type: feetype?.[3]?._id,
      commissionType: "percentage",
      value: 12,
      minimumValue: 10
    },
    {
      user: adminId?._id,
      type: feetype?.[4]?._id,
      commissionType: "percentage",
      value: 12,
      minimumValue: 10
    },
    {
      user: adminId?._id,
      type: feetype?.[5]?._id,
      commissionType: "percentage",
      value: 12,
      minimumValue: 10
    }
    ]

    const existsData = await FeeStructure.find({});

    if(existsData.length == 0) {

      for (const item of DataArray) {
        await FeeStructure.create({user:item?.user, type: item?.type,commissionType: item?.commissionType,value: item?.value});
      }
        
      console.log("Fee Structure is created successfully");

    } else {
      console.log("Fee Structure data is already exists");
    }   
}

// Execute the Fee Structure seeder
seedFeeStructure().then(() => {
  console.log("Fee Structure seeding completed");
  process.exit(0);
}).catch((err) => {
  console.error("Error seeding fee Structure:", err);
  process.exit(1);
});