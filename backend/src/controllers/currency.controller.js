const axios = require('axios');
const { Account } = require('../models/account.model');
const { Currency } = require('../models/currency.model');
const { Countries } = require('../models/country.model');
const { CurrencyList } = require('../models/currencylist.model');

module.exports = {
  // This is used for add currency data
  addCurrency: async(req,res) => {
    
    const {base_code,currencyName,time_last_update_unix,result,conversion_rates,time_last_update_words,status} = req.body;

    try {

      if(base_code == "") {
        return res.status(401).json({
          status: 401,
          message: "Currency Code is required",
          data: null
        });
      }
           
      const CurrencyExists = await Currency.findOne({base_code});

      if(CurrencyExists) {
        return res.status(401).json({
         status: 401,
         message: "Currency is already added in record",
         data: null
        });
      }

      const valueGet = await convertCurrencyAmount(base_code);
        
      if(!valueGet) {
        return res.status(401).json({
          status: 401,
          message: "Something went wrong!!!",
          data: null
        });
      }

      const currency = await Currency.create({
        base_code,
        time_last_update_unix:valueGet?.time_last_update_unix,
        result:valueGet?.result,
        currencyName:currencyName ? currencyName : '',
        time_last_update_words:valueGet?.time_last_update_unix,
        conversion_rates:valueGet?.conversion_rates,
        status:true
      });
    
      if(!currency) {
        return  res.status(401).json({
          status: 401,
          message: "Error while inserting currency data",
          data: null
        });
      }
          
      return res.status(200).json({
        status: 201,
        message: "Currency data is added Successfully!!!",
        data:currency
      });

    } catch (error) {
       console.log(error);
       return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      });
     }
  },
  // This is used for fetch currency data
  list: async(req,res) => {
      
    try {
 
      const details = await Currency.find({}).sort({defaultc: -1});

      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching currency list!!!",
          data: null
        })
      }
 
      return res.status(201).json({
        status:201,
        message: "Currency list is Successfully fetched",
        data: details
      });

     } catch (error) {
        return  res.status(500).json({
          status:500,
          message: "Something went wrong",
          data: null
       });
     }
  },
  // This is used for fetching currency data of logged in User
  currencyList: async(req,res) => {
      
    try {
      
      const details = await CurrencyList.find({});

      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching currency list!!!",
          data: null
        })
      }

      return res.status(201).json({
        status:201,
        message: "Currency list is Successfully fetched",
        data: details
      });

     } catch (error) {
        return  res.status(500).json({
          status:500,
          message: "Something went wrong",
          data: null
       });
     }
  },
  // This is used for fetching currency data of logged in User
  countryList: async(req,res) => {
      
    try {
        
      const details = await Countries.find({}).select("name iso2");
  
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching country list!!!",
          data: null
        })
      }
        
      return res.status(201).json({
        status:201,
        message: "Country list is Successfully fetched",
        data: details
      });
  
    } catch (error) {
        return  res.status(500).json({
          status:500,
          message: "Something went wrong",
          data: null
       });
     }
  },
  // This is used for get currency data by their id
  currencyById: async(req,res) => {
      
    try {
 
      const currency_id = req.params.id;
      if(!currency_id) {
        return res.status(402).json({
          status: 402,
          message: "Currency Id is missing",
          data: null
        });
       }

      const details = await Currency.findOne({base_code: currency_id});
  
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching currency details!!!",
          data: null
        });
      }
  
      return res.status(201).json({
        status:201,
        message: "Currency list is Successfully fetched",
        data: details
      });

    } catch (error) {
      return res.status(500).json({
        status:500,
        message: "Something went wrong with api",
        data: error
      });
    }
  },
  // This is used for delete individual currency data by their id
  currencyDelete: async(req,res) => {
    const { base_code } = req.body;
    const currency_id = req.params.id;

    if(!currency_id) {
      return res.status(402).json({
        status: 402,
        message: "Currency Id is missing",
        data: null
      });
    }

    if(!base_code) {
      return res.status(402).json({
        status: 402,
        message: "Currency Code is missing",
        data: null
      });
    }

    const currencyExists = await Account.find({ currency: base_code });

    if(currencyExists?.length > 0) {
      return res.status(402).json({
        status: 402,
        message: "System is not allowed to delete the currency because this currency is already alloted to someone user with their account",
        data: null
      });
    }

    const deletedData = await Currency.deleteOne({_id: currency_id});
    
    if(!deletedData) {
      return res.status(401).json({
        status:401,
        message: "Error while deleteing currency details!",
        data:null
      });
    }
     
    return res.status(201).json({
      status:201,
      message: "Currency data has been deleted successfully"
    })

  },
  // This is used for add currency data
  exChangeCurrency: async(req,res) => {

    const {from,to,value} = req.body;
        
    try {
     if(from == "" || to == "" || value == "") {
      return res.status(402).json({
        status: 402,
        message: "from and to currency is missing",
        data: null
      });
    }
 
    const getRates = await Currency.findOne({base_code:from});
         
    if(!getRates) {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };
           
      const addedCurrency = await fetch(`https://v6.exchangerate-api.com/v6/1f7c99d1918ed4703f0367a4/latest/${from}`, requestOptions)
      const response = await addedCurrency.json();
      const result = await JSON.stringify(response);
      if(result) {
        const val = JSON.parse(result);

        const currency = await Currency.create({
          base_code:val.base_code,
          time_last_update_unix:val.time_last_update_unix,
          result:val.result,
          time_last_update_words:val.time_last_update_utc,
          conversion_rates:val.conversion_rates,
          status:true
        });
                 
        const calCulateValue = parseFloat(value*currency.conversion_rates[0][to]).toFixed(2);
        
        return res.status(201).json({
          status: 201,
          message: "Success",
          data: calCulateValue,
          rate: parseFloat(currency.conversion_rates[0][to]).toFixed(2)
        })
 
       }
     }
 
     let date1 = new Date().toISOString().replace('T', ' ').substring(0, 10)
     let date2 = getRates.createdAt.toISOString().replace('T', ' ').substring(0, 10)
         
     if(date1 > date2) {
      const deletedResult = await Currency.findOneAndDelete({
        base_code: from
      })
 
      if(deletedResult) {
        const requestOptions = {
          method: "GET",
          redirect: "follow"
        };
               
        const addedCurrency = await fetch(`https://v6.exchangerate-api.com/v6/1f7c99d1918ed4703f0367a4/latest/${from}`, requestOptions)
        const response = await addedCurrency.json();
        const result = await JSON.stringify(response);

        if(result) {
         const val = JSON.parse(result);
         const currency = await Currency.create({
          base_code:val.base_code,
          time_last_update_unix:val.time_last_update_unix,
          result:val.result,
          time_last_update_words:val.time_last_update_utc,
          conversion_rates:val.conversion_rates,
          status:true
        });
                     
        const calCulateValue = parseFloat(value*currency.conversion_rates[0][to]).toFixed(2);
           
        return res.status(201).json({
          status: 201,
          message: "Success",
          data: calCulateValue,
          rate: parseFloat(getRates.conversion_rates[0][to]).toFixed(2),
          type:2
        });
     
       }
      }
            
    } else {
      const calCulateValue = parseFloat(value*getRates.conversion_rates[0][to]).toFixed(2);
      return res.status(201).json({
        status: 201,
        message: "Success",
        data: calCulateValue,
        rate: parseFloat(getRates.conversion_rates[0][to]).toFixed(2),
        type:1
      });
    }
   } catch (error) {
      return res.status(500).json({
        status:500,
        message: "Something went wrong",
        data: null
      });
    }
  },
  // This is used for get convert one currency to another currency data
  getExchangeValue: async(req,res) => {
    const {from,to} = req.body;

    try {

      if(from == "" || to == "") {
        return res.status(401).json({
          status: 401,
          message: "From and To Currency Value is missing",
          data: null
        });
      }

      const options = {
        method: 'GET',
        url: 'https://currency-converter18.p.rapidapi.com/api/v1/convert',
        params: {
          from: from,
          to: to,
          amount: 1
        },
        headers: {
         'X-RapidAPI-Key': process.env.RAPID_API_KEY,
         'X-RapidAPI-Host': process.env.RAPID_API_HOST
        }
       };
       
       try {
          const response = await axios.request(options);
          if(response.data.success) {
            return res.status(201).json({
              status: 201,
              message: "Success",
              data: response.data.result.convertedAmount
            }); 
          } else {
            return res.status(401).json({
              status: 401,
              message: response.data.validationMessage[0],
              data: null
            }) 
          }
       } catch (error) {
          console.log(`Error Exchange API Error at currency controller`);
          return res.status(500).json({
            status: 500,
            message: "Something Went wrong",
            data: null
          }); 
       }
    } catch (error) {
      console.log(`Error Exchange API Error at currency controller`);
      return res.status(500).json({
        status: 500,
        message: "Something Went wrong",
        data: null
      });
    }

  },
  // This is used for update currency status by their id
  updateCurrencyDefaultStatus: async(req,res) => {
    const {isDefault} = req.body;
    
    const cid = req.params.id;

    try {
      if(cid == "" && isDefault == "") {
        return res.status(401).json({
          status: 401,
          message: "Default Status is missing",
          data: null
        })
      }

      await Currency.updateMany(
      {},
      {
        defaultc: false
      },
      {
        new: true,
      })
    
      const UpdateCurrencyStatus = await Currency.findByIdAndUpdate(
      {
        _id:cid
      },
      {
        defaultc: isDefault
      },
      {
        new: true,
      })
    
      if(!UpdateCurrencyStatus) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating tax data",
          data: null
        })
      }

      const currencyStatusDefault = await Currency.findOne({ defaultc: true });

      if(!currencyStatusDefault) {
        await Currency.findOneAndUpdate(
        {
          base_code: "USD"
        },
        {
          defaultc: true
        },
        {
          new: true,
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Currency Status data has been saved !!!",
        data:UpdateCurrencyStatus
      });

      } catch (error) {
        console.log(error);
        return res.status(500).json({
          status: 500,
          message: "Something went wrong with api",
          data: error
        });
      }
  },
  }

// This is used for currency conversion data
async function convertCurrencyAmount(from) {
  if(from) {
    const options = {
      method: 'GET',
      url: `https://v6.exchangerate-api.com/v6/1f7c99d1918ed4703f0367a4/latest/${from}`,
      headers: {
       'X-RapidAPI-Key': process.env.RAPID_API_KEY,
       'X-RapidAPI-Host': process.env.RAPID_API_HOST
      }
    };
     
    try {
      const response = await axios.request(options);

      if(response.data.result) {
        return response?.data;
      } else {
        return 0;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

