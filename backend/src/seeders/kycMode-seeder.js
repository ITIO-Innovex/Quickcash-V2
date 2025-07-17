const mongoose = require('mongoose');
const KycMethod = require('../models/kycMode.model'); // adjust the path as needed
require('dotenv').config();

const mongoURI = 'mongodb+srv://ganeshs:yHZOEwXPmMsdmNcD@exchangedb.jnm8wmc.mongodb.net/?retryWrites=true&w=majority&appName=Exchangedb';
async function seedManualKyc() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected ✅');

    // Check if manual type already exists (optional)
    const existing = await KycMethod.findOne({ type: 'manual' });
    if (existing) {
      console.log('Manual KYC method already exists.');
      return process.exit(0);
    }

    // Insert the manual KYC method
    await KycMethod.create({
      type: 'manual',
      isDefault: true, // or false based on your logic
    });

    console.log('✅ Manual KYC method seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedManualKyc();
