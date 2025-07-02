// useValidation.js
import { useState } from 'react';
import { validateEmail, validatePassword,validatePasswordConfirm } from '../utils/validationUtils';
import { validatePhoneNumber } from '../utils/validationUtils';
import { validateImage } from '../utils/imageValidation';
import { validateDocumentType } from '../utils/validationUtils';
import {validateDocumentNumber,validateName,validateAddress,validateCountry,validateState,validateCity,validatePincode,validateTitle,validateTaxid} from '../utils/validationUtils';
import {validateTaxValue} from '../utils/validationUtils';
import {validatePrefix} from '../utils/validationUtils';
import {validateRegardsText} from '../utils/validationUtils';
import {validateDate} from '../utils/validationUtils';
import {validateDueDate} from '../utils/validationUtils';
import {validateCurrency} from '../utils/validationUtils';
import {validateSubject} from '../utils/validationUtils';
import {validateMessage} from '../utils/validationUtils'; 

const useValidation = () => {
  const [errors, setErrors] = useState({ email: '',memberEmail:'', password: '',cpassword:'',phone:'',phone2:'','files[]':'',DocumentType:'', DocumentNumber:'',file:'', name:'',memberName:'', address:'', memberAddress:'',country:'',state:'',city:'',pincode:'',title:'',taxid:'',value:'',prefix:'',regardsText:'',date:'',dueDate:'',currency:'',subject:'',message:'' });

  const validate =  (field:any, value:any, password='null') => {
    let error = '';

    if (field === 'email' || field === 'memberEmail') {
      error = validateEmail(value) ? '' : 'Please enter correct email.';
    } else if (field === 'password') {
      error = validatePassword(value).isValid ? '' : validatePassword(value).message;
    } else if (field === 'cpassword'){
      error = validatePasswordConfirm(value, password) ? '': 'Password does not match';
    } else if (field === 'phone') {
      console.log("phone value",value);
      error = validatePhoneNumber(value).isValid ? '' : validatePhoneNumber(value).message;
    }else if (field === 'phone2') {
      error = validatePhoneNumber(value).isValid ? '' : validatePhoneNumber(value).message;
    }else if (field === 'DocumentType'){
      error = validateDocumentType(value) ? '' : "Document type is required.";
    }else if (field === 'DocumentNumber'){
      error = validateDocumentNumber(value) ? '' : "Document number is required.";
    }else if(field === 'files[]'){
      const result =  validateImage(value,5 * 1024 * 1024,['image/jpg','image/png','application/pdf','image/jpeg','image/webp']); 
      error =  result.isValid?'':result.message
    }
    else if(field === 'file'){
      const result =  validateImage(value,5 * 1024 * 1024,['image/jpg','image/png','application/pdf','image/jpeg','image/webp']); 
      error =  result.isValid ?'' : result.message
    }else if(field === 'name' || field === 'memberName'){
      const result = validateName(value);
      error = result.isValid ? '': result.message
    }else if(field === 'address' || field === 'memberAddress'){
      error = validateAddress(value)?'':'Address field is required.'
    }else if(field === 'country'){
      console.log(value);
      error = validateCountry(value)?'':'Country field is required.'
    }else if(field === 'state'){
      console.log(value);
      error = validateState(value)?'':'State field is required.'
    }else if(field === 'city'){
      error = validateCity(value)?'':'City field is required.'
    }else if(field === 'pincode'){
      error = validatePincode(value)?'':'Pincode field is required.'
    }else if(field === 'title'){
      error = validateTitle(value)?'':'Title field is required.'
    }else if(field === 'taxid'){
      error = validateTaxid(value)?'':'Tax Id is required.'
    }else if(field === 'value'){
      console.log(value)
      error = validateTaxValue(value)?'':'Tax Rate field is required.'
    }else if(field === 'prefix'){
      error = validatePrefix(value)?'':'Prefix field is required.'
    }else if(field==='regardsText'){
      error = validateRegardsText(value)?'':'Regards text field is required.'
    }else if(field==='date'){
      error = validateDate(value).isValid ?'':validateDate(value).message
    }else if (field === 'dueDate'){
      error = validateDueDate(value.date,value.dueDate).isValid?'':validateDueDate(value.date,value.dueDate).message;
    }else if (field === 'currency'){
      error = validateCurrency(value)?'' : 'Currency field is required.'
    }else if (field === 'subject'){
      error = validateSubject(value)?'' : 'Subject field is required.'
    }else if (field === 'message'){
      error = validateMessage(value)?'' : 'Message field is required.'
    }
    

    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    return error;
  };

  return { errors, validate };
};

export default useValidation;
