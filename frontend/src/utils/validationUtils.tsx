export const validateEmail = (email:any) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password:any)=>{
    const passMessagePrefix = 'Password must contain at least one, ';
    const errors = [];
    let flag = 0;
    if(!/(?=.*[a-z])/.test(password)){
      errors.push('lowercase letter');
      flag=1;
    }
    if(!/(?=.*[A-Z])/.test(password)){
      errors.push('uppercase letter');
      flag=1;
    }
    if(!/(?=.*[!@#$%&*,.?])/.test(password)){
      errors.push('special character');
      flag=1;
    }
    if(!/(?=.*[0-9])/.test(password)){
      errors.push('numeric value');
      flag=1;
    }
    if(password && password.length <8){
      errors.push('The password must be at least 8 character long.');
    }
    return{
      isValid: errors.length === 0,
      message: flag===1 ? passMessagePrefix+ errors.join(', '): errors.join(', ')
    }
  }

  export const validatePasswordConfirm = (confirmPassword:any, password:any) => {
    if(password === confirmPassword){
      return true;
    } else {
      return false;
    }
  }

  export const validatePhoneNumber = (data:any)=>{
    if(Object.keys(data).length === 0){
      return{
        isValid: false,
        message: "Phone number is required."
      }
    } else {
      return{
        isValid: data.valueLength === data.countryLength,
        message: data.valueLength === data.countryLength ? '' : "Invalid phone number."
      }
    }
  }

  export const validateDocumentType = (document:any)=>{
    if(document != ''){
      return true;
    }else{
      return false
    }
  }

  export const validateDocumentNumber = (documentNumber:any)=>{
    if(documentNumber){
      return true;
    } else {
      return false;
    }
  }

  export const validateName = (name:any)=>{
    if(!name){
      return{
        isValid:false,
        message:"Name field is required."
      }
    }else if(name.length < 3){
      return{
        isValid:false,
        message:"Name must be atleast 3 character long."
      }
    }else{
      return{
        isValid:true,
        message:""
      }
    }
  }

  export const validateAddress = (address:any)=>{
    if(address){
      return true
    }else{
      return false;
    }
  }

  export const validateCountry = (country:any)=>{
    if(country){
      return true
    }else{
      return false;
    }
  }

  export const validateState =(state:any)=>{
    if(state){
      return true
    } else {
      return false;
    }
  }

  export const validateCity =(city:any)=>{
    if(city){
      return true
    }else{
      return false;
    }
  }

  export const validatePincode =(pincode:any)=>{
    if(pincode){
      return true
    }else{
      return false;
    }
  }

  export const validateTitle =(title:any)=>{
    if(title){
      return true
    }else{
      return false;
    }
  }

  export const validateTaxid =(taxid:any)=>{
    if(taxid){
      return true
    } else {
      return false;
    }
  }

  export const validateTaxValue = (taxvalue:any)=>{
    if(taxvalue){
      return true;
    }else{
      return false;
    }
  }

  export const validatePrefix = (prefix:any)=>{
    if(prefix){
      return true;
    }else{
      return false;
    }
  }

  export const validateRegardsText = (regardsText:any)=>{
    if(regardsText){
      return true;
    } else {
      return false;
    }
  }

  export const validateDate = (date:any)=>{
    // notEmpty, pastDate
    const errors =[];
    const currDate = new Date().toISOString().split('T')[0];

    if(!date){
      errors.push("Date field is required");
    }
    if(date < currDate){
      errors.push("Past date is not acceptable, Please enter valid date")
    }
    return{
      isValid: errors.length === 0,
      message: errors.join(', ')
    }
  }

  export const validateDueDate = (date:any, dueDate:any )=>{
    // notEmpty, pastDate, greaterThenDate
    const errors =[];
    const currDate = new Date().toISOString().split('T')[0];
    if(!dueDate){
      errors.push("Due Date field is required");
    }
    if(dueDate < currDate){
      errors.push("Past Due Date is not acceptable, Please enter valid date");
    }
    if(dueDate < date){
      errors.push("Due Date should be greater then Date");
    }
    return{
      isValid: errors.length === 0,
      message: errors.join(', ')
    }
  }

  export const validateCurrency = (value:any)=>{
    if(value){
      return true;
    }else{
      return false;
    }
  }

  export const validateSubject = (value:any)=>{
    if(value){
      return true;
    }else{
      return false;
    }
  }

  export const validateMessage = (value:any)=>{
    if(value){
      return true;
    } else {
      return false;
    }
  }