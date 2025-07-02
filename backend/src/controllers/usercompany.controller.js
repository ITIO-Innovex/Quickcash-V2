const { mongoose} = require("mongoose");
const { UserCompany } = require('../models/usercompany.model');

module.exports = {
  addCompany: async(req,res) => {
    const {
      user,
      businessType,
      businessRegistrationNumber,
      taxIdentificationNumber,
      tradingAddress,
      country
    } = req.body;

    try {
      if(user == "" || businessType == "" || businessRegistrationNumber == "" || taxIdentificationNumber == "") {
        return res.status(401).json({
          status: 401,
          message: "Business Type, Business Registration No and Tax ID fields are mandatory",
          data: null
        })
      }

      let Image1  = '';
      let Image2 = '';
      let Image3 = '';

      if(req.files.businessRegistrationDocument) {
        Image1 = req.files.businessRegistrationDocument[0].filename;
      }

      if(req.files.proofoftradingAddress) {
        Image2 = req.files.proofoftradingAddress[0].filename;
      }
            
      if(req.files.taxID) {
        Image3 = req.files.taxID[0].filename;
      }

      const useComp = await UserCompany.findOne({businessRegistrationNumber});
    
      if(useComp) {
        return res.status(401).json({
          status: 401,
          message: "Business Registratrion is already added in our record",
          data: null
        })
      }
    
      const userCompan = await UserCompany.create({
        user,
        businessType,
        businessRegistrationNumber,
        taxIdentificationNumber,
        tradingAddress,
        country,
        businessRegistrationDocument:Image1,
        proofoftradingAddress:Image2,
        taxID:Image3
      })
    
      if(!userCompan) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting or inserting card data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Company details is added Successfully!!!",
        data:userCompan
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
  companyList: async(req,res) => {
      
    const user_id = req.params.id; 
    const title = req.query.title || '';
    const ObjectId = mongoose.Types.ObjectId;

    try {
            
      if(!user_id) {
        return res.status(402).json({
          status: 402,
          message: "User Id is missing",
          data: null
        })
      }

      const companyDetails = await UserCompany.find({user: new ObjectId(user_id)})

      if(!companyDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching card list!!!",
          data: null,
        });
      }
 
       return res.status(201).json({
        status:201,
        message: "User Company list is Successfully fetched",
        data: companyDetails,
       });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching card list!!!",
        data: error
      })
    }
  },
  companyById: async(req,res) => {
      
    try {
      const user_id = req.params.id;
  
      if(!user_id) {
       return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
       })
      }
  
      const details = await UserCompany.findOne({_id: user_id});
  
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching card details!!!",
          data: null
        })
      }
  
      return res.status(201).json({
        status:201,
        message: "Company details is Successfully fetched",
        data: details
      });
        
     } catch (error) {
        return res.status(500).json({
          status:500,
          message: "Something went wrong with api",
          data: error
       })
     }
  },
  updateCompany: async(req,res) => {

    try {
            
      const {
        user,
        businessType,
        businessRegistrationNumber,
        taxIdentificationNumber,
        tradingAddress,
        country
      } = req.body;
      
      const company_id =  req.params.id;

      let Image1  = '';
      let Image2 = '';
      let Image3 = '';

      if(req.files.businessRegistrationDocument) {
        Image1 = req.files.businessRegistrationDocument[0].filename;
      }
      
      if(req.files.proofoftradingAddress) {
        Image2 = req.files.proofoftradingAddress[0].filename;
      }
      
      if(req.files.taxID) {
        Image3 = req.files.taxID[0].filename;
      }
              
      if(user == "" || businessType == "" || businessRegistrationNumber == "" || taxIdentificationNumber == "") {
        return res.status(401).json({
          status: 401,
          message: "Business Type, Business Registration No and Tax ID fields are mandatory",
          data: null
        })
      }

      if(Image1) {
        await UserCompany.findByIdAndUpdate(
        {
          _id:company_id
        },
        {
          businessRegistrationDocument:Image1
        },
        {
          new: true,
        })
      }

      if(Image2) {
        await UserCompany.findByIdAndUpdate(
        {
          _id:company_id
        },
        {
         proofoftradingAddress:Image2
        },
        {
          new: true,
        })
      }

      if(Image3) {
        await UserCompany.findByIdAndUpdate(
        {
          _id:company_id
        },
        {
          taxID:Image3
        },
        {
          new: true,
        })
      }
    
      const UpdateData = await UserCompany.findByIdAndUpdate(
      {
       _id:company_id
      },
      {
        user,
        businessType,
        businessRegistrationNumber,
        taxIdentificationNumber,
        tradingAddress,
        country
      },
      {
        new: true,
      })
      
      if(!UpdateData) {
        console.log(UpdateData);
        return  res.status(401).json({
          status:401,
          message: "Error while updating company details!",
          data:null
        })
      }
      
      return res.status(201).json({
        status:201,
        data:UpdateData,
        message: "User Company details has been updated successfully"
      })
    } catch (error) {
        console.log("Error", error);
        return  res.status(401).json({
          status:401,
          message: error,
          data:null
        })    
      }
  },
  deleteCompany: async(req,res) => {
    
    try {
            
      const company_id = req.params.id;
              
      if(company_id == "") {
        return res.status(401).json({
          status: 401,
          message: "Company Id is missing",
          data: null
        });
      }

      const deletedData = await UserCompany.deleteOne({_id: company_id});

      if(!deletedData) {
        return  res.status(401).json({
          status:401,
          message: "Error while updating company details!",
          data:null
        })
      }
      
      return res.status(201).json({
        status:201,
        message: "User Company Data has been deleted successfully"
      });

    } catch (error) {
      console.log("Error", error);
      return  res.status(401).json({
        status:401,
        message: error,
        data:null
      });    
    }
  }
}
