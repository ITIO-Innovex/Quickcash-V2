const { PaymentSetting } = require('../../models/Admin/paymentsetting.model');

module.exports = {
  addSetting: async(req,res) => {
    try {
      const {stripe_key,stripe_secret,paypal_client_id,paypal_secret,razor_key,razor_secret,itio_store_id,itio_api_key,stripe_status,paypal_status,razor_status,itio_status} = req.body;

      await PaymentSetting.deleteMany({});

      const insertData = await PaymentSetting.create({
        stripe_key,stripe_secret,paypal_client_id,paypal_secret,razor_key,razor_secret,itio_store_id,itio_api_key,stripe_status,paypal_status,razor_status,itio_status
      });
    
      if(!insertData) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting or inserting coin data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Payment Gateway Details is updated Successfully!!!",
        data:insertData
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
  settingData: async(req,res) => {

  try {

   const Details = await PaymentSetting.find({});

   if(!Details) {
     return res.status(402).json({
       status: 402,
       message: "Error while fetching payment gateway details list!!!",
       data: null,
     })
   }
 
    return res.status(201).json({
      status:201,
      message: "Payment gateway list is Successfully fetched",
      data: Details,
    })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching payment gateway list!!!",
        data: error
      })
    }
  }
}
