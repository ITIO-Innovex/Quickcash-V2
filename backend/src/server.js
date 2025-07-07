const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const moment = require('moment');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
require('dotenv').config();
const connectDB = require('./db/index');
const { Invoice } = require('./models/invoice.model');
const { Quote } = require('./models/quote.model');
const cron = require('node-cron');
const { mongoose} = require("mongoose");
const playwright = require('playwright');
const CryptoJS = require("crypto-js");
const passport =require("passport");
const session = require('express-session');
require('./middlewares/passport.middleware');
const otpRoutes = require('./routes/otp.route');
const linkedinAuthRoutes = require('./routes/linkedin.route');
const chatSocket = require('../socket/chat.socket.js');
// Created cors setting here, as we setup socket and server on different port

// const io = socketIo(server, {
//   path:'/socket.io',
//   cors: {
//     origin: 'https://quickcash.oyefin.com',
//     methods: ["GET", "POST"],
//     transports: ["polling"],
//     credentials: true
//   },
//   allowEIO4: true
// });

const io = socketIo(server, {
  cors: {
    origin: '*',
    transports: ["polling"]
  },
  allowEIO4: true
});

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(cookieParser());

app.use(cors({
  origin: "*"
}));

// for security purpose we have to use this , will not disclose express server in browser window (specially in Wappylyzer chrome extension)
app.use(
  helmet({
    contentSecurityPolicy: false,
    xDownloadOptions: false,
    crossOriginResourcePolicy: false
  }),
);

app.use(express.json());
//Chat Socket IO
chatSocket(io);
const os = require("os");
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, '/views'));

if(process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "dist")));
}

app.use(express.static("public"));
app.use(express.static("uploads"));

console.log("Path", path.resolve(path.join(__dirname, '../../storage/profile')));
app.use('/storage',express.static(path.resolve(path.join(__dirname, '../../storage/profile'))));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/exports', express.static(path.join(__dirname, '../exports')));

// Passport Session
app.use(
  session({
    secret: 'supersecretkey', // use env variable in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true only if using HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());
// Routes defined User

const taxRoute               =   require('./routes/tax.route');
const KycRoute               =   require('./routes/kyc.route');
const CardRoute              =   require('./routes/card.route');
const userRoute              =   require('./routes/user.route');
const qrCodeRoute            =   require('./routes/qrcode.route');
const CryptoRoute            =   require('./routes/crypto.route');
const MemberRoute            =   require('./routes/member.route');
const WalletRoute            =   require('./routes/wallet.route');
const invoiceRoute           =   require('./routes/invoice.route');
const ReferalRoute           =   require('./routes/referal.route');
const SupportRoute           =   require('./routes/support.route');
const accountRoute           =   require('./routes/account.route');
const CurrencyRoute          =   require('./routes/currency.route');
const UserSession            =   require('./routes/usersession.route');
const ReceipientRoute        =   require('./routes/reciepient.route');
const TransactionRoute       =   require('./routes/transaction.route');
const UserCompanyRoute       =   require('./routes/usercompany.route');
const invoiceSettingRoute    =   require('./routes/invoicesetting.route');
const templateSettingRoute   =   require('./routes/templatesetting.route');
const WalletAddressRequest   =   require('./routes/walletaddressrequest.route');
const invoiceCategoryRoute   =   require('./routes/category.route');
const invoiceProductRoute    =   require('./routes/product.route');
const invoiceUserClientRoute =   require('./routes/client.route');
const ManualPaymentRoute     =   require('./routes/manualPayment.route');
const QuoteRoute             =   require('./routes/quote.route');
const DigitalSignatureRoute  =   require('./routes/DigitalSignature/index.js');    //Digital Signature route Import 


// const offerRoutes = require('./routes/p2poffer.route');
// const tradeRoutes = require('./routes/p2ptrade.route');
const p2pOrderRoutes = require('./routes/p2pOrder.routes');
const p2pTradeRoutes = require('./routes/tradeDeal.routes');
//const paymentDetailRoutes = require('./routes/payment.routes');
const p2pRoutes = require('./routes/p2p.route');
const authRoutes = require("./routes/auth.routes");
const oauthRoutes = require("./routes/oauth.route");
app.use('/auth', linkedinAuthRoutes);

app.get('/api/v1/health', (req,res) => {
  return res.status(200).json({
    status:200,
    message: "Api is working fine",
    data: JSON.stringify(req.headers),
    systemos: os.type()
  })
})

// route for view invoice data
app.get('/invoice/:id', async (req,res) => {
  const invNumber = req.params.id;
  const InvoiceDetails = await Invoice.findOne({ invoice_number: invNumber });

  if(!InvoiceDetails) {
    return res.status(401).json({
      status:401,
      message: "Invoice doesn't exists"
    })
  }

  const details = await Invoice.aggregate([
  {
    $match: {
      invoice_number: invNumber
    }
  },
  {
    $lookup: {
      "from": "users",
      "localField": "user",
      "foreignField": "_id",
      "as": "userDetails"
    }
  },
  {
    $lookup: {
      "from": "qrcodes",
      "localField": "user",
      "foreignField": "user",
      "as": "qrcodeDetails"
    }
  },
  {
    $lookup: {
      "from": "invoicesettings",
      "localField": "user",
      "foreignField": "user",
      "as": "settingsDetails"
    }
  },
  {
    $project: {
    _id:1,
    user:1,
    invoice_number:1,
    invoice_date:1,
    paidAmount:1,
    due_date:1,
    status:1,
    transactionStatus:1,
    othersInfo:1,
    url:1,
    userid:1,
    invoice_country:1,
    payment_qr_code:1,
    currency_text:1,
    currency:1,
    recurring:1,
    recurring_cycle:1,
    productsInfo:1,
    discount:1,
    discount_type:1,
    tax:1,
    subTotal:1,
    sub_discount:1,
    sub_tax:1,
    total:1,
    createdAt:1,
    createdBy:1,
    dueAmount:1,
    note:1,
    terms:1,
    userDetails: {
    _id: 1,
    name: 1,
    email: 1,
    mobile: 1,      
    address: 1,
    state:1,
    postalcode:1,
    city: 1,
    country: 1,
    defaultCurrency: 1,
    status:1
  },
    qrcodeDetails: {
    _id:1,
    title:1,
    image:1
  },
    settingsDetails: {
      user:1,
      invoice_country:1,
      company_name:1,
      mobile:1,
      state:1,
      city:1,
      zipcode:1,
      address:1,
      logo:1,
      regardstext:1
    }
   }
   },
  ])

  return res.render('InvoiceTemplates/Default/default.ejs',{details: details, baseUrl: process.env.LIVE_BASE_URL2});
})

// route for get quote pdf
app.get('/quote/:id', async (req,res) => {
  const invNumber = req.params.id;
  const QuoteDetails = await Quote.findOne({ quote_number: invNumber });

  if(!QuoteDetails) {
    return res.status(401).json({
      status:401,
      message: "Quote doesn't exists"
    })
  }

  const details = await Quote.aggregate([
  {
    $match: {
      quote_number: invNumber
    }
  },
  {
    $lookup: {
      "from": "users",
      "localField": "user",
      "foreignField": "_id",
      "as": "userDetails"
    }
  },
  {
    $lookup: {
      "from": "qrcodes",
      "localField": "user",
      "foreignField": "user",
      "as": "qrcodeDetails"
    }
  },
  {
    $lookup: {
      "from": "invoicesettings",
      "localField": "user",
      "foreignField": "user",
      "as": "settingsDetails"
    }
  },
  {
    $project: {
    _id:1,
    user:1,
    quote_number:1,
    invoice_date:1,
    paidAmount:1,
    due_date:1,
    status:1,
    transactionStatus:1,
    othersInfo:1,
    url:1,
    userid:1,
    invoice_country:1,
    payment_qr_code:1,
    currency_text:1,
    currency:1,
    recurring:1,
    recurring_cycle:1,
    productsInfo:1,
    discount:1,
    discount_type:1,
    tax:1,
    subTotal:1,
    sub_discount:1,
    sub_tax:1,
    total:1,
    createdAt:1,
    createdBy:1,
    dueAmount:1,
    note:1,
    terms:1,
    userDetails: {
    _id: 1,
    name: 1,
    email: 1,
    mobile: 1,      
    address: 1,
    state:1,
    postalcode:1,
    city: 1,
    country: 1,
    defaultCurrency: 1,
    status:1
  },
   qrcodeDetails: {
    _id:1,
    title:1,
    image:1
   },
   settingsDetails: {
    user:1,
    invoice_country:1,
    company_name:1,
    mobile:1,
    state:1,
    city:1,
    zipcode:1,
    address:1,
    logo:1,
    regardstext:1
   }
  }
  },
  ])

  return res.render('InvoiceTemplates/quotes.ejs',{details: details, baseUrl: process.env.LIVE_BASE_URL2});
})

// route for converted url into pdf
app.get('/invoicepdf/:id', async (req,res) => {
  const val = await createPdf(req?.params?.id);
  setTimeout(() => {
    return res.redirect(`${process.env.LIVE_BASE_URL2}invoices/${req?.params?.id}/Invoice_${req?.params?.id}.pdf`);
  },2000);
})

// app.use('/api/api/v1/tax',taxRoute);
app.use('/api/v1/tax',taxRoute);
app.use('/api/v1/kyc',KycRoute);
app.use('/api/v1/card',CardRoute);
app.use('/api/v1/user',userRoute);
app.use('/api/v1/qrcode',qrCodeRoute);
app.use('/api/v1/crypto',CryptoRoute);
app.use('/api/v1/wallet',WalletRoute);
app.use('/api/v1/member',MemberRoute);
app.use('/api/v1/referal',ReferalRoute);
app.use('/api/v1/support',SupportRoute);
app.use('/api/v1/account',accountRoute);
app.use('/api/v1/session', UserSession);
app.use('/api/v1/invoice', invoiceRoute);
app.use('/api/v1/currency',CurrencyRoute);
app.use('/api/v1/company',UserCompanyRoute);
app.use('/api/v1/receipient',ReceipientRoute);
app.use('/api/v1/transaction',TransactionRoute);
app.use('/api/v1/invoicesetting', invoiceSettingRoute);
app.use('/api/v1/templateSetting',templateSettingRoute);
app.use('/api/v1/walletaddressrequest',WalletAddressRequest);
app.use('/api/v1/category', invoiceCategoryRoute); // Invoice Category
app.use('/api/v1/product', invoiceProductRoute); // Invoice Product
app.use('/api/v1/client', invoiceUserClientRoute); // Invoice User Client
app.use('/api/v1/manualPayment', ManualPaymentRoute); // Invoice Manual Payment List
app.use('/api/v1/quote', QuoteRoute); // Quote Route
// ===========DigitalSignature Route =================
app.use('/api/v1/digital-signature', DigitalSignatureRoute);
// ===========DigitalSignature Route End =============
//app.use('/api/v1/p2p', paymentDetailRoutes); // Payment Details Route
// Google Authentication Routes
app.use('/auth/', oauthRoutes);
// Use the OTP routes
app.use('/api/v1/otp', otpRoutes);
//P2P Order Routes
app.use('/api/v1/p2p/orders', p2pOrderRoutes);
//P2P Trade Routes
app.use('/api/v1/p2p/trades', p2pTradeRoutes);
// Use the p2p Trade & Offer routes
// app.use('/api/v1/p2poffers', offerRoutes);
// app.use('/api/v1/p2ptrades', tradeRoutes);
app.use('/api/v1/p2p', p2pRoutes);
// Routes related to payment

const itiopay         =   require('./routes/Payment/itiopay.route');
const EcommerceRoute  =   require('./routes/ecommerce.route');
const paypalPayRoute  =   require('./routes/Payment/paypal.route');
const stripePayRoute  =   require('./routes/Payment/stripe.route');
const razorPayRoute   =   require('./routes/Payment/razorpay.route');

app.use('/api/v1/itiopay',itiopay);
app.use('/api/v1/paypal', paypalPayRoute);
app.use('/api/v1/stripe', stripePayRoute);
app.use('/api/v1/razorpay', razorPayRoute);
app.use('/api/v1/ecommerce', EcommerceRoute);
app.use('/api/v1/authemail', authRoutes);

// Routes defined Admin

const feeRoute                    =   require('./routes/Admin/fee.route');
const feeTypeRoute                =   require('./routes/Admin/feetype.route');
const coinRoute                   =   require('./routes/Admin/coin.route');
const adminRoute                  =   require('./routes/Admin/admin.route');
const AdminTaxRoute               =   require('./routes/admintax.route');
const AdminqrcodeRoute            =   require('./routes/adminqrcode.route');
const coinPairRoute               =   require('./routes/Admin/coinpair.route');
const AdminInvoiceRoute           =   require('./routes/admininvoice.route');
const AdminInvoiceSettingRoute    =   require('./routes/admininvoicesetting.route');
const AdminPaymentSettingRoute    =   require('./routes/Admin/paymentsetting.route');
const AdminTemplateSettingRoute   =   require('./routes/admintemplatesetting.route');
const AdminRevenueRoute           =   require("./routes/revenue.route");
const AdminNotificationRoute      =   require('./routes/notification.route');
const { Client }                  =   require('./models/client.model');
const { QrCode }                  =   require('./models/qrcode.model');
const { addNotification }         =   require('./middlewares/notification.middleware');
const { sendMailWithAttachment }  =   require('./middlewares/mail.middleware');
const { InvoiceSetting }          =   require('./models/invoicesetting.model');
const { TemplateSetting }         =   require('./models/templatesetting.model');

app.use('/api/v1/admin',adminRoute);
app.use('/api/v1/admin/fee',feeRoute);
app.use('/api/v1/admin/feetype',feeTypeRoute);
app.use('/api/v1/admin/coin',coinRoute);
app.use('/api/v1/admin/tax',AdminTaxRoute);
app.use('/api/v1/admin/coinpair',coinPairRoute);
app.use('/api/v1/admin/qrcode',AdminqrcodeRoute);
app.use('/api/v1/admin/invoice',AdminInvoiceRoute);
app.use('/api/v1/admin/paymentSetting', AdminPaymentSettingRoute);
app.use('/api/v1/admin/invoicesetting',AdminInvoiceSettingRoute);
app.use('/api/v1/admin/templateSetting',AdminTemplateSettingRoute);
app.use('/api/v1/admin/revenue',AdminRevenueRoute);
app.use('/api/v1/admin/notification',AdminNotificationRoute);


if(process.env.NODE_ENV == "production") {
  app.use((req, res) => {
   res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
   
  app.use((_, res) => {
    res.send({
     message: 'Not found!'
    });
  });
}

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// global.io = io;

// We created socket object here which we can be used in any controller or anywhere in backend appilcation 
// by simply import from this file by the name of ioObject

const socketIoObject = io;
module.exports.ioObject = socketIoObject;

// cron.schedule('0 0 */1 * * *', async () =>  {
// ('*/2 * * * *', async () =>  {

// This section is cron job task for recurring invoice section 

var task = cron.schedule('0 0 */1 * * *', async () =>  {
  console.log('will execute every 1 hour until stopped server');

  const invoicesData = await Invoice.find({ recurring: 'yes', savetype: 'send' });

  if(!invoicesData) {
    console.log("Invoice data is empty");
  } 

  const currentDate = new Date().toISOString().replace('T', ' ').substring(0, 10);

  invoicesData?.map((item) => {
    if(new Date(item.recurringDate).toISOString().replace('T', ' ').substring(0, 10) == currentDate) {
      console.log("Invoice Created for", item?.invoice_number);
      invoiceShoot(item?.invoice_number);
    }
  });
});

// This function is for preparing invoice data
async function invoiceShoot(invoiceNumber) {
  
  const invoiceDetails = await Invoice.findOne({ invoice_number: invoiceNumber });

  if(!invoiceDetails) {
    return false;
  } else {

  const ObjectId = mongoose.Types.ObjectId;

  const invoiceData = await InvoiceSetting.findOne({user: new ObjectId(invoiceDetails?.user)});

  const newinv = invoiceData?.prefix+Math.floor(Math.random() * 99999);

  var reference = Math.floor(Math.random() * 10000000);
  var ciphertext = CryptoJS.AES.encrypt(`${reference}`, 'ganesh').toString();

  const invoice = await Invoice.create({
    user: invoiceDetails?.user,
    userid: invoiceDetails?.userid,
    account: invoiceDetails?.account,
    reference:reference,
    url: `${process.env.BASE_URL2}/invoice-pay?code=${ciphertext}`,
    othersInfo: invoiceDetails?.othersInfo,
    invoice_number: newinv,
    dueAmount: invoiceDetails?.dueAmount,
    invoice_date: new Date().toISOString().replace('T', ' ').substring(0, 10),
    due_date: moment().add(2,'days'),
    invoice_country: invoiceDetails?.invoice_country,
    payment_qr_code: invoiceDetails?.payment_qr_code,
    currency: invoiceDetails?.currency,
    productsInfo: invoiceDetails?.productsInfo,
    recurring: "no",
    discount: invoiceDetails?.discount,
    discount_type: invoiceDetails?.discount_type,
    status: "unpaid",
    tax: invoiceDetails?.tax,
    subTotal: invoiceDetails?.subTotal,
    sub_discount: invoiceDetails?.sub_discount,
    sub_tax: invoiceDetails?.sub_tax,
    total: invoiceDetails?.total,
    dueAmount: invoiceDetails?.total,
    note: invoiceDetails?.note,
    terms: invoiceDetails?.terms,
    currency_text: invoiceDetails?.currency_text,
    usdtotal: invoiceDetails?.currency == "USD" ? invoiceDetails?.total : await convertCurrencyAmount(invoiceDetails?.currency,"USD",invoiceDetails?.total)
  });

  if(!invoice) {
    return false;
  } else {

    const ObjectId = mongoose.Types.ObjectId;

    recurringDate = moment().add(invoiceDetails?.recurring_cycle,'days');

    const UpdateData = await Invoice.findByIdAndUpdate(
    {
      _id: new ObjectId(invoiceDetails?._id)
    },
    {
      recurringDate
    },
    {
      new: true,
    })

    if(!UpdateData) {
      console.log(UpdateData);
      return false;
    }

    if(invoiceDetails?.userid) {
      var userDetails = await Client.find({_id: new ObjectId(invoiceDetails?.userid)});
    }
       
    if(invoiceDetails?.payment_qr_code) {
      var qrCodeItem = await QrCode.find({_id: new ObjectId(invoiceDetails?.payment_qr_code)});
    } else {
      var qrCodeItem = '';
    }
  
    var qrCodeImage = '';
    if(qrCodeItem) {
      qrCodeImage = qrCodeItem[0].image;
    }
   
    generatePDFfromURL(invoiceDetails?.user,'', 'invoice.pdf', qrCodeImage ? `${process.env.BASE_URL}/qrcode/${qrCodeImage}` : '',newinv, invoiceDetails,userDetails ? userDetails?.[0]?.address : invoiceDetails?.othersInfo?.[0]?.address,userDetails ? userDetails?.[0].email : invoiceDetails?.othersInfo?.[0]?.email,userDetails? userDetails?.[0].firstName : invoiceDetails?.othersInfo?.[0]?.name, invoiceDetails?.url);

    await addNotification(invoiceDetails?.user,title=`New Recurring Invoice has been generated`,tags=`Invoice`,message="New Recurring Invoice has been added",notifyFrom="user",notifyType="invoice",attachment="",info=`New Recurring Invoice has been generated `);
      
   }

  }

}

// This function is for generating pdf by invoice numner/id
async function createPdf(invoiceNumber) {
  
  const invoiceDetails = await Invoice.findOne({ invoice_number: invoiceNumber });

  if(!invoiceDetails) {
    return false;
  } else {

    const ObjectId = mongoose.Types.ObjectId;

    const invoiceData = await InvoiceSetting.findOne({user: new ObjectId(invoiceDetails?.user)});

    if(!invoiceData) {
      return false;
    } else {

    const ObjectId = mongoose.Types.ObjectId;

    if(invoiceDetails?.userid) {
      var userDetails = await Client.find({_id: new ObjectId(invoiceDetails?.userid)});
    }
       
    if(invoiceDetails?.payment_qr_code) {
      var qrCodeItem = await QrCode.find({_id: new ObjectId(invoiceDetails?.payment_qr_code)});
    } else {
      var qrCodeItem = '';
    }
  
    var qrCodeImage = '';
    if(qrCodeItem) {
      qrCodeImage = qrCodeItem[0].image;
    }

    generatePDFfromURL(invoiceDetails?.user,'', 'invoice.pdf', qrCodeImage ? `${process.env.BASE_URL}/qrcode/${qrCodeImage}` : '',invoiceDetails?.invoice_number, invoiceDetails,userDetails ? userDetails?.[0]?.address : invoiceDetails?.othersInfo?.[0]?.address,userDetails ? userDetails?.[0].email : invoiceDetails?.othersInfo?.[0]?.email,userDetails? userDetails?.[0].firstName : invoiceDetails?.othersInfo?.[0]?.name, invoiceDetails?.url,"view");

    //await addNotification(invoiceDetails?.user,title=`New Recurring Invoice has been generated`,tags=`Invoice`,message="New Recurring Invoice has been added",notifyFrom="user",notifyType="invoice",attachment="",info=`New Recurring Invoice has been generated `);
      
    }

  }

}

// This function is used for generating pdf and send attachment to the registered user email id by their invoice id
async function generatePDFfromURL(setting_id,url, outputPath,qrCode,inv,item,address,email,name,urll,vtype="") {

  const invoiceNewData = await Invoice.findOne({ invoice_number:inv });

  var printFileName = '';
  if(item.invoice_country == "Default") {
    printFileName = 'Default/defaultPrint.ejs';
  } else if(item.invoice_country == "New_York") {
    printFileName = 'NewYork/newyorkprint.ejs';
  } else if(item.invoice_country == "Toronto") {
    printFileName = 'Toronto/torontoprint.ejs';
  } else if(item.invoice_country == "Rio") {
    printFileName = 'Rio/rioprint.ejs';
  } else if(item.invoice_country == "London") {
    printFileName = 'London/londonprint.ejs';
  } else if(item.invoice_country == "Istanbul") {
    printFileName = 'Istanbul/istanbulprint.ejs';
  } else if(item.invoice_country == "Mumbai") {
    printFileName = 'Mumbai/mumbaiprint.ejs';
  } else if(item.invoice_country == "Hong_Kong") {
    printFileName = 'HongKong/hongkongprint.ejs';
  } else if(item.invoice_country == "Tokyo") {
    printFileName = 'Tokyo/tokyoprint.ejs';
  } else if(item.invoice_country == "Paris") {
    printFileName = 'Paris/parisprint.ejs';
  } else {
    printFileName = 'Default/defaultPrint.ejs';
  }

  const invoiceData = await InvoiceSetting.find({user: setting_id});

  const printColor = await TemplateSetting.find({invoice_country: item.invoice_country, user: setting_id});

  var byDefaultPrintColor = '';
  if(printColor.length > 0) {
    byDefaultPrintColor = printColor[0]?.color;
  } else {
    byDefaultPrintColor = "#000000";
  }

  var invcsettingData = [];
  if(invoiceData.length > 0) {
    invcsettingData = invoiceData;
  } else {
    invcsettingData = [];
  }

  const logoInvoice = `${process.env.BASE_URL3}/setting/${invoiceData?.[0]?.user}/${invoiceData?.[0]?.logo}`;

  try {
   const ejs = require("ejs");
   ejs.renderFile(__dirname.replace('\controllers','') + `/views/InvoiceTemplates/${printFileName}`, {invoiceData:invcsettingData,byDefaultPrintColor,qrCode,item: invoiceNewData, address , email , name, inv, logoInvoice}, async function (err, data) {
   if (err) {
    console.log("error in Invoice Template file: ",err);
   } else {
     const path = require('path');
     const fs = require('fs');
     const folderName = `public/invoices/${inv}`;
     try {
      if (!fs.existsSync(folderName)) {
       fs.mkdirSync(folderName);
      }
     } catch (err) {
       console.error("error",err);
     }
  
    const pathInvoice = __dirname.replace("src","public/invoices");
    const pdfPath = path.resolve(pathInvoice, inv+`/Invoice_${inv}.pdf`);
    console.log("Invoice pdf path is ", pdfPath);
     
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.setContent(data);
    await page.pdf({ path: pdfPath.replace("controllers","") });
    console.log('PDF generated successfully');
    await browser.close();
    if(vtype != "view") {
      const htmlBody = `Dear ${name} , <br/><br/> Please find herewith below the Invoice <br /><br /> Quick Cash has sent you a Recurring invoice payment link , click on button<br /><br /><br /><a href="${invoiceNewData?.url}" style="margin-bottom:2px; text-decoration: none; cursor: pointer; font-size:16px; background-color: black; color: white; padding: 12px;border-radius: 12px;">Proceed to Pay</a> <br/><br/><br/> Regards <br/> Quick Cash`;
      const subject = "Invoice!!!"
      const emailSent = sendMailWithAttachment(email,subject,htmlBody,pdfPath.replace("controllers",""),title=`Invoice_${inv}.pdf`);
      if(emailSent)
        console.log("Invoice pdf has been sent");
      else 
        console.log("waiting...");
      }
    }
   });
  } catch (error) {
    console.error('Error fetching URL:', error);
  }
}

// This function is used for convert currency
async function convertCurrencyAmount(from,to,amount) {
  if(from && to && amount) {
    const options = {
      method: 'GET',
      url: 'https://currency-converter18.p.rapidapi.com/api/v1/convert',
      params: {
        from: from,
        to: to,
        amount: amount
      },
      headers: {
       'X-RapidAPI-Key': process.env.RAPID_API_KEY,
       'X-RapidAPI-Host': process.env.RAPID_API_HOST
      }
    };
     
    try {
      const response = await axios.request(options);
      if(response.data.success) {
        console.log("from", from,to,amount);
        return response.data.result.convertedAmount;
      } else {
        return 0;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

// This responsible for connecting database to express nodejs
connectDB()
  .then(result => {
    console.log(`MONGODB is connected and server is run on PORT ${process.env.PORT}`);
  }).catch(error => {
    console.log(`Error while connecting MONGODB `,error)       
});

// Below code will listen the server on following port
server.listen(5000, (req, res) => {
  console.log("Server is listening on port 5000");
});

