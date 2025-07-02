// Tech Wizard
export const validateImage =(
    file:File,
    maxSize:number,
    allowedTypes:string[])=>{
        const errors:string[]=[];
        // Conditions
        console.log(file.type);
        if(!file){
          errors.push('Image is required')
        }
        if(!allowedTypes.includes(file.type)){
            // error
            errors.push('Only "JPG", "PNG", "PDF", "JPEG" file types are allowed')
        }
        if(file.size > maxSize){
            // error
            errors.push('Size should not exceed then 5 MB.')
        }
        return{
            isValid: errors.length ===0,
            message: errors.join(', ')
        };
    }