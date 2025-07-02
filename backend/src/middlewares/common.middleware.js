module.exports  = {
  randomId: async(req,res,next) => {
    try {

      const numbers = [...Array(90000).keys()].map(n => n + 10000);
      let filteredNumbers = numbers;
      let timeStamp = new Date().valueOf();
      let randomValue = 0;
      const currentTimeStamp = new Date().valueOf();
        
      if (timeStamp === currentTimeStamp && randomValue !== 0) {
        filteredNumbers = filteredNumbers.filter(n => n !== value)
      } else {
        timeStamp = currentTimeStamp;
        filteredNumbers = numbers;
      }

      randomValue = filteredNumbers[Math.floor(Math.random() * filteredNumbers.length)];

      if(!randomValue) {
        return res.status(401).json({
          status:401,
          message: "Error in Ticket Id generation",
          data: null
        });
      }

      req.ticketid = parseInt(new Date().valueOf() + "" + randomValue, 10);
      next();

    } catch (error) {
      console.log("Error while generating ticket id", error);
      return res.status(401).json({
       status:401,
       message: "Error in Ticket Id generation",
       data: null
      });  
    }
  }
}

