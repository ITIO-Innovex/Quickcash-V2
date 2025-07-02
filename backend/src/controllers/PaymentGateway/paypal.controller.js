const Razorpay = require('razorpay');
const { mongoose} = require("mongoose");
const {Invoice} = require('../../models/invoice.model');
const {InvoiceOrders} = require('../../models/invoiceorders.model');

module.exports = {
  paymentCapture: async(req,res) => {
    const {
      orderDetails,
      userData,
      status,
      notes,
      pendingAmount,
      payAmount,
      paymentType
    } = req.body;  

    try {

      const insertData = await InvoiceOrders.create({
        user: userData?.orderDetails?._id,
        invoice:userData?._id,
        paidAmount:payAmount,
        remainingAmount:paymentType == "partial" ? userData?.total - pendingAmount : userData?.total,
        currency: userData?.currency,
        paymentType:paymentType,
        paymentMode:'paypal',
        paymentNotes:notes,
        transactionId:orderDetails?.id,
        orderId:orderDetails?.payer?.payer_id,
        paymentId:orderDetails?.id,
        status:status,
        extraInfoPayment: orderDetails
      });
      
      if(!insertData) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting invoice data",
          data: null
        })
      }

      const ObjectId = mongoose.Types.ObjectId;
      var dueAmt = 0;
      if(userData?.dueAmount > 0 && pendingAmount > 0) {
        dueAmt = userData?.dueAmount - pendingAmount;
      } else if(userData?.dueAmount == 0 && paymentType == "partial") {
        dueAmt = userData?.total - pendingAmount;
      }
        
      if(status == "COMPLETED") {
        await Invoice.findByIdAndUpdate(
        {
          _id: new ObjectId(userData?._id)
        },
        {
          status: paymentType == "full" ? 'paid' : 'partial',
          dueAmount: dueAmt
        },
        {
          new: true,
        })
      }
                   
      return res.status(200).json({
        status: 201,
        message: "Payment has been done Successfully !!!",
        data:insertData
      });

    } catch (error) {
       console.log(error);
       return res.status(500).json({
        status: 500,
        message: "Error while inserting invoice data",
        data: error
       })
    }
  }
}
