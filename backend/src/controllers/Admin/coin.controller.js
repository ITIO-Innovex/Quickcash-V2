require("dotenv").config();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { FireblocksSDK } = require("fireblocks-sdk");
const { Coin } = require("../../models/Admin/coin.model");

// Fireblocks SDK Initialization
const apiSecret = fs.readFileSync(
  path.resolve("fireblocks_secret6.key"),
  "utf8"
);
const fireblocks = new FireblocksSDK(
  apiSecret,
  process.env.FIREBLOCKS_API_KEY,
  process.env.FIREBLOCKS_BASE_URL
);

// Multer setup for storing logos in "uploads" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../logos/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

module.exports = {
  coinList: async (req, res) => {
    try {
        const assets = await fireblocks.getSupportedAssets();

        // Transforming response to include assetId explicitly
        const formattedAssets = assets.map(asset => ({
            name: asset.name,      
            symbol: asset.symbol,   
            assetId: asset.id,      
            type: asset.type       
        }));

        res.status(200).json({
            success: true,
            message: "Supported coins fetched successfully",
            data: formattedAssets
        });

    } catch (error) {
        console.error(
            "🔥 Error fetching supported assets:",
            error.response ? error.response.data : error.message
        );
        res.status(500).json({
            success: false,
            message: "Failed to fetch coins",
            error: error.response ? error.response.data : error.message,
        });
    }
}
,
addCoin: async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Coin ID is required.",
      });
    }

    // Fetch supported coins from Fireblocks
    const assets = await fireblocks.getSupportedAssets();
    const selectedCoin = assets.find((asset) => asset.id === id);

    if (!selectedCoin) {
      return res.status(404).json({
        success: false,
        message: "Coin not found in Fireblocks.",
      });
    }

    // Check if the coin is already in the database
    const coinExists = await Coin.findOne({ coin: selectedCoin.id });

    if (coinExists) {
      return res.status(400).json({
        success: false,
        message: "Coin already exists in the database.",
      });
    }
    let logoName = selectedCoin.id.includes("_")
    ? selectedCoin.id.split("_")[0]  
    : selectedCoin.id;   
    // console.log(logoName);
    if (logoName.includes("_")) {
    logoName = logoName.split("_")[0]; 
    }
    logoName = logoName.toLowerCase();
    // console.log("🖼️ Final logoName:", logoName);
    // Save coin details to database
    const newCoin = await Coin.create({
      coin: selectedCoin.id,
      name: selectedCoin.name,
      network: selectedCoin.type,
      withdrawFee: 0,
      withdrawMinimum: 0,
      withdrawMaximum: 0,
      logoName: logoName,
    });

    return res.status(201).json({
      success: true,
      message: "Coin added successfully!",
      data: newCoin,
    });
  } catch (error) {
    console.error(" Error adding coin:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
},
  getAllCoins: async (req, res) => {

    try {
      const coins = await Coin.find(
        { disabled: { $ne: true } },
        {
          _id: 1,
          coin: 1,
          name: 1,
          network: 1,
          withdrawFee: 1,
          withdrawMinimum: 1,
          withdrawMaximum: 1,
          logo: 1,
          logoName:1,
          createdAt: 1,
          isDefault:1,
        }
      ).sort({ createdAt: -1 });

      if (!coins || coins.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No coins found in the database.",
          data: [],
        });
      }

      // console.log("✅ Coins fetched successfully:", coins.length);
      return res.status(200).json({
        success: true,
        message: `${coins.length} coins fetched successfully`,
        data: coins,
      });
    } catch (error) {
      console.error("🔥 Error fetching coins:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch coins from the database",
        error: error.message,
      });
    }
  },
  updateCoin: async (req, res) => {
    try {
      const { coinId } = req.params;
      const {
        coin,
        name,
        network,
        withdrawFee,
        withdrawMinimum,
        withdrawMaximum,
      } = req.body;
      
      const logo = req.file ? `/logos/${req.file.filename}` : null; 
  
      if (!coinId) {
        return res.status(400).json({
          success: false,
          message: "Coin ID is required.",
        });
      }
      // Build dynamic update object
      const updateFields = {};
      if (coin) updateFields.coin = coin;
      if (name) updateFields.name = name;
      if (network) updateFields.network = network;
      if (withdrawFee) updateFields.withdrawFee = withdrawFee;
      if (withdrawMinimum) updateFields.withdrawMinimum = withdrawMinimum;
      if (withdrawMaximum) updateFields.withdrawMaximum = withdrawMaximum;
      if (logo) updateFields.logo = logo; // Only update if a new logo is uploaded
  
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No fields provided for update.",
        });
      }
  
      // Find and update the coin with only the provided fields
      const updatedCoin = await Coin.findByIdAndUpdate(coinId, updateFields, {
        new: true,
      });
  
      if (!updatedCoin) {
        return res.status(404).json({
          success: false,
          message: "Coin not found or update failed.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Coin updated successfully!",
        data: updatedCoin,
        
      });
      
    } catch (error) {
      // console.error("🔥 Error updating coin:", error.message);
      return res.status(500).json({
        success: false,
        message: "Something went wrong.",
        error: error.message,
      });
    }
  },

  deleteCoin : async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Coin ID is required.",
        });
      }
  
      // Find and update the coin
      const updatedCoin = await Coin.findByIdAndUpdate(
        id,
        { disabled: true },
        { new: true }
      );
  
      if (!updatedCoin) {
        return res.status(404).json({
          success: false,
          message: "Coin not found.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Coin has been disabled successfully.",
        data: updatedCoin,
      });
    } catch (error) {
      // console.error("🔥 Error disabling coin:", error.message);
      return res.status(500).json({
        success: false,
        message: "Something went wrong.",
        error: error.message,
      });
    }
  }, 
  setDefaultCoin: async (req, res) => {
    try {
      const { coinId } = req.params;
      console.log('received coin id',req.params)
  
      if (!coinId) {
        return res.status(400).json({
          success: false,
          message: "Coin ID is required.",
        });
      }
  
      const coin = await Coin.findById(coinId);
      if (!coin) {
        return res.status(404).json({
          success: false,
          message: "Coin not found.",
        });
      }
  
      try {
        await Coin.updateMany({ isDefault: true }, { $set: { isDefault: false } });
      } catch (err) {
        console.error("Failed to update coins:", err);
      }
  
      coin.isDefault = true;
      await coin.save();
  
      return res.status(200).json({
        success: true,
        message: `${coin.name} is now set as the default coin.`,
        data: coin,
      });
  
    } catch (error) {
      console.error("🔥 Error setting default coin:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
        error: error.message,
      });
    }
  },
};


// Export multer middleware for routes
module.exports.upload = upload;
