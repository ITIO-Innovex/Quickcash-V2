const { mongoose} = require("mongoose");
const { Product } = require("../models/product.model");
const { Category } = require("../models/category.model");

module.exports = {
  // Add category controller function
  addCategory: async(req,res) => {
    const {name} = req.body;
    try {
      if(name == "") {
        return res.status(401).json({
          status: 401,
           message: "Name fields are mandatory",
          data: null
        })
      }
    
      const category = await Category.create({
        user:req?.user?._id,
        name
      });
    
      if(!category) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting category data",
          data: null
        });
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Category has been added Successfully!!!",
        data:category
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
  // This is used for fetching category list from the category table
  categoryList: async(req,res) => {
      
      const user_id = req.params.id; 
      const title = req.query.title || '';
      const ObjectId = mongoose.Types.ObjectId;

      try {
            
        if(!user_id) {
          return res.status(402).json({
            status: 402,
            message: "User Id is missing",
            data: null
          });
        }

        const catDetails = await Category.aggregate([
        {
          $match: {
            user: new ObjectId(user_id),
            name: {'$regex': title, '$options' : 'i'}
          }
        },
        {
          $lookup: {
            "from": "products",
            "localField": "_id",
            "foreignField": "category",
            "as": "productDetails"
          }
        },
        {
          $project: {
            _id:1,
            user:1,
            name:1,
            status:1,
            createdAt:1,
            productDetails: {
             _id:1
           }
          },
        }
      ]);

        if(!catDetails) {
          return res.status(402).json({
            status: 402,
            message: "Error while fetching category list!!!",
            data: null,
          })
        }
 
          return res.status(201).json({
            status:201,
            message: "Category list is Successfully fetched",
            data: catDetails,
          });

       } catch (error) {
          console.log(error);
          return res.status(500).json({
            status: 500,
            message: "Error while fetching category list!!!",
            data: error
          })
       }
  },
  // This is used for fetching category details by their id
  catById: async(req,res) => {
      
    try {
    
      const cat_id = req.params.id;
  
      if(!cat_id) {
        return res.status(402).json({
          status: 402,
          message: "Category Id is missing",
          data: null
        })
      }
  
      const details = await Category.findOne({_id: cat_id});
  
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching category details!!!",
          data: null
        })
      }
  
      return res.status(201).json({
        status:201,
        message: "Category details is Successfully fetched",
        data: details
      })
    } catch (error) {
       return res.status(500).json({
        status:500,
        message: "Something went wrong with api",
        data: error
      })
    }
  },
  // This is used for uodate category details from the category table
  updateCategory: async(req,res) => {
   try {
              
    const {name} = req.body;

    const cat_id = req?.params?.id;
              
    if(name == "") {
      return res.status(401).json({
        status: 401,
        message: "All red star mark * fields are mandatory!!!",
        data: null
      })
    }
    
    const UpdateData = await Category.findByIdAndUpdate(
    {
      _id:cat_id
    },
    {
      user:req?.user?._id,
      name
    },
    {
      new: true,
    })
      
    if(!UpdateData) {
      console.log(UpdateData);
      return res.status(401).json({
        status:401,
        message: "Error while updating category details!",
        data:null
      })
    }
      
    return res.status(201).json({
      status:201,
      message: "User Category details has been updated successfully"
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
  // This is used for delete category data by their id
  deleteCategory: async(req,res) => {
      
    try {
            
     const category_id = req.params.id;
           
    if(category_id == "") {
      return res.status(401).json({
        status: 401,
        message: "Category Id is missing",
        data: null
      })
    }

    // Check if category has been included in any product
    // if yes , then don't allow to delete
    // if no, then allow to delete

    const categoryUsedInAnyProduct = await Product.findOne({ category: category_id });

   if(categoryUsedInAnyProduct) {
    return res.status(401).json({
      status:401,
      message: "Category wouldn't allow to delete as it is used in invoice product",
      data:null
    })
   }

    const deletedData = await Category.deleteOne({_id: category_id});

    if(!deletedData) {
      return  res.status(401).json({
        status:401,
        message: "Error while deleting category details!",
        data:null
      })
    }
      
    return res.status(201).json({
      status:201,
      message: "Category Data has been deleted successfully"
    })
  } catch (error) {
     console.log("Error", error);
     return  res.status(401).json({
      status:401,
      message: error,
      data:null
    })    
   }
  }
}
