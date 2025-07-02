const { mongoose} = require("mongoose");
const { Invoice } = require("../models/invoice.model");
const { product, Product } = require("../models/product.model");

module.exports = {
  // Add Product controller function
  addProduct: async(req,res) => {
    const {name,user,productCode,category,unitPrice,description} = req.body;
    try {
      if(name == "" || user == "" || productCode == "" || category == "" || unitPrice == "") {
        return res.status(401).json({
          status: 401,
           message: "Name, Product Code , Category and Unit Price fields are mandatory",
          data: null
        })
      }
    
      const productData = await Product.create({
        user,
        name,
        category,
        unitPrice,
        productCode,
        description
      })
    
      if(!productData) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting product data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Product has been added Successfully!!!",
        data:product
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
  // This function is used for fetching product list data
  productList: async(req,res) => {
      
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

        const proDetails = await Product.find({
          user: new ObjectId(user_id),
          name: {'$regex': title, '$options' : 'i'},
        });

        if(!proDetails) {
          return res.status(402).json({
            status: 402,
            message: "Error while fetching product list!!!",
            data: null,
          })
        }
 
        return res.status(201).json({
          status:201,
          message: "Product list is Successfully fetched",
          data: proDetails,
        });

       } catch (error) {
          console.log(error);
          return res.status(500).json({
            status: 500,
            message: "Error while fetching product list!!!",
            data: error
          })
       }
  },
  // This function is used for fetching data (Mobile API)
  productListApi: async(req,res) => {
      
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

      const proDetails = await Product.aggregate([
      {
        $match: {
          user: new ObjectId(user_id),
          name: {'$regex': title, '$options' : 'i'}
        }
      },
      {
        $lookup: {
          "from": "categories",
          "localField": "category",
          "foreignField": "_id",
          "as": "categoryDetails"
        }
      },
      {
        $project: {
          _id:1,
          user:1,
          name:1,
          status:1,
          unitPrice:1,
          productCode:1,
          createdAt:1,
          categoryDetails: {
          _id:1,
          name:1
        }
        },
      }
      ]);

      if(!proDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching product list!!!",
          data: null,
        })
      }

      return res.status(201).json({
        status:201,
        message: "Product list is Successfully fetched",
        data: proDetails,
      });

     } catch (error) {
        console.log(error);
        return res.status(500).json({
          status: 500,
          message: "Error while fetching product list!!!",
          data: error
        });
     }
  },
  // This function is used for fetching data by their id
  proById: async(req,res) => {
    const ObjectId = mongoose.Types.ObjectId;
    try {
    
      const pro_id = req.params.id;
  
      if(!pro_id) {
        return res.status(402).json({
          status: 402,
          message: "Product Id is missing",
          data: null
        });
      }
  
      const details = await Product.findOne({_id: new ObjectId(pro_id)});
  
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching product details!!!",
          data: null
        });
      }
  
      return res.status(201).json({
        status:201,
        message: "Product details is Successfully fetched",
        data: details
      });

    } catch (error) {
       console.log(error);
       return res.status(500).json({
        status:500,
        message: "Something went wrong with api",
        data: error
      });
    }
  },
  // This function is used for update product data
  updateProduct: async(req,res) => {
    const ObjectId = mongoose.Types.ObjectId;
   try {
              
    const {name,user_id,productCode,category,unitPrice,description} = req.body;
    const pro_id = req?.params?.id;
              
    if(name == "" || user_id == "" || productCode == "" || category == "" || unitPrice == "") {
      return res.status(401).json({
        status: 401,
        message: "All red star mark * fields are mandatory!!!",
        data: null
      });
    }
    
    const UpdateData = await Product.findByIdAndUpdate(
    {
      _id:pro_id
    },
    {
      user:user_id,
      name,
      productCode,
      category: new ObjectId(category),
      description,
      unitPrice
    },
    {
      new: true,
    });
      
    if(!UpdateData) {
      console.log(UpdateData);
      return res.status(401).json({
        status:401,
        message: "Error while updating product details!",
        data:null
      });
    }
      
    return res.status(201).json({
      status:201,
      message: "User Product details has been updated successfully"
    });

   } catch (error) {
     console.log("Error", error);
     return  res.status(401).json({
      status:401,
      message: error,
      data:null
    });    
   }
  },
  // This function is used for delete product data by their id
  deleteProduct: async(req,res) => {
      
    try {
            
     const product_id = req.params.id;
           
    if(product_id == "") {
      return res.status(401).json({
        status: 401,
        message: "Product Id is missing",
        data: null
      })
    }

    // Check if product has been included in any invoice
    // if yes , then don't allow to delete
    // if no, then allow to delete

    const productUsedInAnyInvoice = await Invoice.findOne({ product: product_id });

    if(productUsedInAnyInvoice) {
     return res.status(401).json({
      status:401,
      message: "Product wouldn't allow to delete as it is used in invoice",
      data:null
     });
    }

    const deletedData = await Product.deleteOne({_id: product_id});

    if(!deletedData) {
      return  res.status(401).json({
        status:401,
        message: "Error while deleting product details!",
        data:null
      });
    }
      
    return res.status(201).json({
      status:201,
      message: "Product Data has been deleted successfully"
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
