const fs = require("fs");
const path = require("path");
const excelJS = require("exceljs");
const { mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { User } = require("../models/user.model");
const { WalletAddressRequest} = require("../models/walletAddressRequest.model");
const { addNotification } = require("../middlewares/notification.middleware");
const FireblocksSDK = require("fireblocks-sdk").FireblocksSDK;
const baseUrl = "https://sandbox-api.fireblocks.io";
//const productionbaseUrl = "https://api.fireblocks.io";
// const apiSecret = fs.readFileSync(
//   path.resolve("fireblocks_secret6.key"),
//   "utf8"
// );
const secretPath = path.resolve("fireblocks_secret6.key");
console.log(" Secret Key Path:", secretPath);

const apiSecret = fs.readFileSync(secretPath, "utf8");
let fireblocks = new FireblocksSDK(
  apiSecret,
  process.env.FIREBLOCKS_API_KEY,
  baseUrl
);
// console.log(" FIREBLOCK_API_KEY:", process.env.FIREBLOCKS_API_KEY);
// console.log(" Fireblocks Secret Key Exists?", fs.existsSync(path.resolve("fireblocks_secret6.key")));
// console.log("Fireblocks Secret Key Content:", fs.readFileSync(path.resolve("fireblocks_secret6.key"), "utf8").slice(0, 50) + "...");

module.exports = {

addWalletRequest: async (req, res) => {
  const { user, coin, walletAddress, status, email } = req.body;
  const cleanCoin = coin.includes("_TEST") ? coin.replace("_TEST", "") : coin;

  try {
    console.log("Received request to add wallet:", {
      user,
      coin: cleanCoin,
      walletAddress,
      status,
      email,
    });

    if (!user || !coin) {
      console.log("Validation failed: user or coin is empty");
      return res.status(401).json({
        status: 401,
        message: "Please select coin",
        data: null,
      });
    }

    const userVaultAccount = await User.findById(user);
    if (!userVaultAccount) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    let vaultId = userVaultAccount.vaultAccountId;
    let addressData = "";

    if (!vaultId) {
      const newVaultId = await createVaultAccount(userVaultAccount.email);
      if (!newVaultId) {
        console.log("Failed to create new vault account");
        return res.status(500).json({
          status: 500,
          message: "Vault account creation failed",
          data: null,
        });
      }

      await User.updateOne({ _id: user }, { vaultAccountId: newVaultId });
      vaultId = newVaultId;
    }

    // Try creating wallet address
    addressData = await createVaultWalletAddress(user, coin, parseInt(vaultId));
   // First check this specific known message
if (addressData === "Asset is deprecated. Use a different asset.") {
  return res.status(400).json({
    status: 400,
    message: "Asset is deprecated. Use a different asset.",
    data: addressData,
  });
}

// Then handle generic error
if (!addressData || addressData.error) {
  return res.status(500).json({
    status: 500,
    message: addressData?.error || "Wallet address creation failed",
    data: addressData,
  });
}
    return res.status(201).json({
      status: 201,
      message: "Wallet Address data is added !!!",
      data: addressData,
    });

  } catch (error) {
    console.error("❌ Error in addWalletRequest:", error.message);
    return res.status(500).json({
      status: 500,
      message: error.message || "Something went wrong with API",
      data: error,
    });
  }
},
  // This function is used for request new wallet address and save details to the table
  newWalletRequest: async (req, res) => {
    const { user, coin } = req.body;
    try {
      console.log(" Received request to create a new wallet:", {
        user,
        coin,
      });

      //  Validate request
      if (!user || !coin) {
        console.log(" Validation failed: User ID or Coin is missing.");
        return res.status(400).json({
          status: 400,
          message: "User ID and Coin are required.",
          data: null,
        });
      }

      //  Fetch user's Vault Account ID
      const userData = await User.findOne({ _id: user });
      if (!userData?.vaultAccountId) {
        console.log(" User Vault Account ID not found.");
        return res.status(404).json({
          status: 404,
          message: "User Vault Account ID not found.",
          data: null,
        });
      }

      const addressData = await newVaultWalletAddress(user, coin, parseInt(userData.vaultAccountId));

      
      //  Ensure addressData is a valid string
      if (!addressData || typeof addressData !== "string") {
          console.log(" Invalid addressData received:", addressData);
          return res.status(500).json({
              status: 500,
              message: "Failed to generate wallet address.",
              data: null,
          });
      }
      
      // Remove any prefix before ':'
      const cleanAddress = addressData.includes(":") ? addressData.split(":")[1] : addressData;
      
      // console.log("Cleaned Wallet Address:", cleanAddress);
      
      return res.status(201).json({
          status: 201,
          message: "Wallet Address successfully generated!",
          data: cleanAddress,
      });
    } catch (error) {
      console.error(" Error in newWalletRequest:", error);
      return res.status(500).json({
        status: 500,
        message: "An error occurred while processing your request.",
        data: error,
      });
    }
  },
 getSupportedAssets : async (req, res) => {
    try {
        const supportedAssets = await fireblocks.getSupportedAssets();

        if (!supportedAssets || supportedAssets.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No supported assets found.",
                data: [],
            });
        }

        console.log(" Supported Assets Fetched:", supportedAssets.length);
        return res.status(200).json({
            status: 200,
            message: "Supported assets retrieved successfully.",
            data: supportedAssets,
        });
    } catch (error) {
        console.error(" Error fetching supported assets:", error?.response?.data || error.message);
        return res.status(500).json({
            status: 500,
            message: "Failed to retrieve supported assets.",
            data: error?.response?.data || error.message,
        });
    }
},
  // This function is used for fetch wallet address list and save details to the table
  list: async (req, res) => {
    const userid = req?.params?.id;
    const ObjectId = mongoose.Types.ObjectId;
    try {
      const listDetails = await WalletAddressRequest.aggregate([
        {
          $match: {
            user: new ObjectId(userid),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            coin: 1,
            user: 1,
            walletAddress: 1,
            status: 1,
            noOfCoins: 1,
            createdAt: 1,
            userDetails: {
              _id: 1,
              name: 1,
              email: 1,
              mobile: 1,
              address: 1,
              city: 1,
              country: 1,
              defaultCurrency: 1,
              status: 1,
            },
          },
        },
      ]);

      if (!listDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching add wallet address request!!!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "list are fetched Successfully",
        data: listDetails,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching wallet address request list!!!",
        data: error,
      });
    }
  },
  // This function is used for fetch wallet address list and save details to the table (For Admin Panel)
  adminlist: async (req, res) => {
    try {
      const listDetails = await WalletAddressRequest.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            coin: 1,
            user: 1,
            walletAddress: 1,
            status: 1,
            noOfCoins: 1,
            createdAt: 1,
            userDetails: {
              _id: 1,
              name: 1,
              email: 1,
              mobile: 1,
              address: 1,
              city: 1,
              country: 1,
              defaultCurrency: 1,
              status: 1,
            },
          },
        },
      ]);

      if (!listDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching add wallet address request!!!",
          data: null,
        });
      }

      return res.status(201).json({
        status: 201,
        message: "list are fetched Successfully",
        data: listDetails,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching wallet address request list!!!",
        data: error,
      });
    }
  },
  // This function is used for update wallet address request and save details to the table
  updateWalletRequestStatus: async (req, res) => {
    const { status, comment } = req.body;

    try {
      const wallet_id = req.params.id;

      if (!wallet_id) {
        return res.status(401).json({
          status: 401,
          message: "wallet id is missing",
          data: null,
        });
      }

      if (status == "") {
        return res.status(401).json({
          status: 401,
          message: "status is missing",
          data: null,
        });
      }

      var addressData = "";
      const ObjectId = mongoose.Types.ObjectId;
      const walletRequestDetails = await WalletAddressRequest.findOne({
        _id: new ObjectId(req?.params?.id),
      });
      const userVaultAccountId = await User.findOne({
        _id: walletRequestDetails?.user,
      });

      if (status == "completed") {
        if (userVaultAccountId?.vaultAccountId) {
          var addressData = await createVaultWalletAddress(
            req?.params?.id,
            walletRequestDetails?.coin,
            parseInt(userVaultAccountId?.vaultAccountId)
          );
        } else {
          var vid = await createVaultAccount(userVaultAccountId?.email);
          var addressData = await createVaultWalletAddress(
            req?.params?.id,
            walletRequestDetails?.coin,
            parseInt(vid)
          );
        }
      }

      const UpdateData = await WalletAddressRequest.findByIdAndUpdate(
        {
          _id: wallet_id,
        },
        {
          status,
          walletAddress: addressData,
          comment: comment ? comment : "",
          history: [],
        },
        {
          new: true,
        }
      );

      if (!UpdateData) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating qr Wallet Address Request!",
          data: null,
        });
      }

      await addNotification(
        walletRequestDetails?.user,
        (title = `Wallet Address request status been updated by the Admin`),
        (tags = `Crypto, ${walletRequestDetails?.coin}`),
        (message = `Wallet Address request status has been updated by the Admin for coin ${walletRequestDetails?.coin}`),
        (notifyFrom = "admin"),
        (notifyType = "user"),
        (attachment = ""),
        (info = `Crypto Coin ${walletRequestDetails?.coin} - wallet address request status has been updated by the Admin `)
      );

      return res.status(201).json({
        status: 201,
        data: UpdateData,
        message: "Wallet Address Request has been updated successfully",
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
  fetchWalletAddress: async (req, res) => {
  try {
    const userId = req.user?.id; 
    const { coin } = req.query;

    if (!userId || !coin) {
      return res.status(400).json({ status: 400, message: "User or coin missing" });
    }

    const existingWallet = await WalletAddressRequest.findOne({
      user: userId,
      coin: coin,
    });

    if (!existingWallet) {
      return res.status(404).json({ status: 404, message: "Wallet not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Wallet found successfully",
      data: existingWallet.walletAddress,
    });
  } catch (error) {
    console.error("❌ Error in fetchWalletAddress:", error.message);
    return res.status(500).json({
      status: 500,
      message: error.message || "Something went wrong",
    });
  }
},
  // This function is used for update history and save details to the table
  updateHistory: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(401).json({
          status: 401,
          message: "Wallet ID is missing",
          data: null,
        });
      }
  
      const details = await WalletAddressRequest.findOne({ _id: id }); 
  
      if (!details) {
        return res.status(404).json({
          status: 404,
          message: "Wallet not found!",
          data: null,
        });
      }
  
      return res.status(200).json({
        status: 200,
        data: details.history || [],
        message: "History has been fetched successfully",
      });
    } catch (error) {
      console.error("❌ Error in updateHistory:", error);
      return res.status(500).json({
        status: 500,
        data: null, 
        message: "Internal server error",
      });
    }
  },
  // This function is used for export excel of transaction and save details to the table
  exportExcelForTransaction: async (req, res) => {
    const workbook = new excelJS.Workbook(); // Create a new workbook
    const worksheet = workbook.addWorksheet("WalletList"); // New Worksheet
    const path = "./public"; // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
      { header: "S no.", key: "s_no", width: 10 },
      { header: "Date", key: "createdAt", width: 20 },
      { header: "Coin", key: "coin", width: 20 },
      { header: "No Of Coins", key: "noOfCoins", width: 20 },
      { header: "Wallet Address", key: "walletAddress", width: 20 },
      { header: "Status", key: "status", width: 20 },
    ];

    const invoiceData = await WalletAddressRequest.find({
      user: req.params.id,
    });

    // Looping through User data
    let counter = 1;
    invoiceData.forEach((user) => {
      user.s_no = counter;
      worksheet.addRow(user); // Add data in worksheet
      counter++;
    });

    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    try {
      await workbook.xlsx.writeFile(`${path}/walletList.xlsx`).then(() => {
        res.send({
          status: "success",
          message: "file successfully downloaded",
          path: `${path}/walletList.xlsx`,
        });
      });
    } catch (err) {
      res.send({
        status: "error",
        message: "Something went wrong",
      });
    }
  },
};
async function getWalletAddress(user, vaultAccountId, assetId) {
  try {
    const ObjectId = mongoose.Types.ObjectId;
    const myNewVault = await fireblocks.getPaginatedAddresses(
      vaultAccountId,
      assetId
    );
    if (myNewVault?.addresses) {
      if (myNewVault?.addresses?.length > 0) {
        const walletUpdate = await WalletAddressRequest.findOneAndUpdate(
          {
            user: new ObjectId(user),
            coin: assetId,
          },
          {
            walletAddress: myNewVault?.addresses?.[0]?.address,
          },
          {
            new: true,
          }
        );

        if (!walletUpdate) {
          const wallet = await WalletAddressRequest.create({
            user,
            coin: assetId,
            noOfCoins: "0.0000000",
            walletAddress: myNewVault?.addresses?.[0]?.address,
            status: "completed",
          });
        }
        return myNewVault?.addresses?.[0]?.address;
      } else {
        const vaultAccount = await fireblocks.generateNewAddress(
          vaultAccountId,
          assetId
        );
        return vaultAccount?.address;
      }
    }
  } catch (error) {
    console.log("Get Address error ", error.response.data.message);
  }
}
// 🔥 Vault Account Create
async function createVaultAccount(email) {
  try {

    // Fireblocks API Call (Vault Account Create)
    const vaultAccount = await fireblocks.createVaultAccount(
      email,
      false,
      "",
      false
    );
    // console.log(
    //   " Vault Account Response:",
    //   JSON.stringify(vaultAccount, null, 2)
    // );

    if (!vaultAccount || !vaultAccount.id) {
      throw new Error(
        "❌ Failed to create vault account: No vault ID returned."
      );
    }
     return vaultAccount.id;
  } catch (error) {
    console.error(
      " Error in createVaultAccount:",
      error?.response?.data || error.message
    );
    return null;
  }
}

const createVaultWalletAddress = async (userid, assetId, vaultAccountId) => {
  try {

    let walletAddress = "";

    try {
      const vaultAccount = await fireblocks.createVaultAsset(
        vaultAccountId,
        assetId
      );
      walletAddress = vaultAccount?.address || "";
    } catch (error) {
      if (error?.response?.data?.code === 1026) {
        //  If Asset Already Exists
        walletAddress = await fetchWalletAddressFromVault(
          vaultAccountId,
          assetId
        );
      } else {
        console.error(
          " Error creating vault asset:",
          error?.response?.data || error
        );
        return "Asset is deprecated. Use a different asset.";
      }
    }

    // If no wallet address found, return error
    if (!walletAddress) {
      return "Asset is deprecated. Use a different asset.";
    }

    // **Remove Prefix (bchtest:) and Keep Only Address**
    walletAddress = walletAddress.includes(":")
      ? walletAddress.split(":")[1]
      : walletAddress;
    walletAddress = walletAddress.trim();

    const existsCoinAddress = await WalletAddressRequest.findOne({
      user: new ObjectId(userid),
      coin: assetId,
    });

    if (!existsCoinAddress) {
      await WalletAddressRequest.create({
        user: new ObjectId(userid),
        coin: assetId,
        noOfCoins: "0.0000000",
        walletAddress: walletAddress,
        status: "completed",
      });
    } else {
      await WalletAddressRequest.findOneAndUpdate(
        { user: new ObjectId(userid), coin: assetId },
        { walletAddress: walletAddress },
        { new: true }
      );
    }

    return walletAddress;
  } catch (error) {
    console.error(
      "❌ Error in createVaultWalletAddress:",
      error?.response?.data || error
    );
    return "Something went wrong.";
  }
};

async function newVaultWalletAddress(userId, assetId, vaultAccountId) {
  try {
    // console.log(" Request to generate a new wallet address:", { userId, assetId, vaultAccountId });

    // ✅ Generate a new wallet address using Fireblocks
    const vaultAccount = await fireblocks.generateNewAddress(vaultAccountId, assetId);
    // console.log(" Fireblocks Response:", vaultAccount);

    if (!vaultAccount?.address) {
      console.log(" Failed to generate wallet address.");
      return null;
    }

    //  Remove prefix before saving to DB
    const walletAddress = vaultAccount.address.replace(/^[^:]+:/, "");  
    // console.log(" Cleaned Wallet Address:", walletAddress);

    // Check if the user already has a wallet for this coin
    const ObjectId = mongoose.Types.ObjectId;
    const existingWallet = await WalletAddressRequest.findOne({ user: new ObjectId(userId), coin: assetId });

    if (!existingWallet) {
      // 🆕 First-time wallet creation
      await WalletAddressRequest.create({
        user: new ObjectId(userId),
        coin: assetId,
        noOfCoins: "0.0000000",
        walletAddress, // Save cleaned address
        status: "completed",
      });
      // console.log(" New wallet entry saved to the database.");
    } else {
      // 🔄 Update existing wallet address
      await WalletAddressRequest.findOneAndUpdate(
        { user: new ObjectId(userId), coin: assetId },
        { walletAddress }, // Save cleaned address
        { new: true }
      );
      // console.log("Existing wallet entry updated in the database.");
    }

    return walletAddress;

  } catch (error) {
    console.error(" Error in newVaultWalletAddress:", error?.response?.data || error.message);
    return null;
  }
};
const fetchWalletAddressFromVault = async (vaultAccountId, assetId) => {
  try {
    // console.log(
    //   ` Fetching wallet address for asset ${assetId} in vault ${vaultAccountId}...`
    // );

    //  Correct API call for fetching deposit addresses
    const depositAddresses = await fireblocks.getDepositAddresses(
      vaultAccountId,
      assetId
    );

    // console.log(
    //   " Full Deposit Addresses Response:",
    //   JSON.stringify(depositAddresses, null, 2)
    // );

    if (!depositAddresses || depositAddresses.length === 0) {
      console.warn(" No deposit addresses found!");
      return null;
    }

    //  Extract first deposit address
    const walletAddress = depositAddresses[0]?.address || null;

    if (!walletAddress) {
      console.warn(" No wallet address found in deposit addresses response.");
      return null;
    }

    return walletAddress;
  } catch (error) {
    console.error(
      " Error fetching wallet address:",
      error?.response?.data || error
    );
    return null;
  }
};