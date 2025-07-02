// Responses that will be sent to the client
const successMessage = (message) => {
    return { message };
  };
  
  const errorMessage = (error) => {
    return { error };
  };
  
  module.exports = { successMessage, errorMessage };
  