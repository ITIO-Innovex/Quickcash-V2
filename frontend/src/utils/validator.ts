export const isValidateEmail = (email: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isEmpty = (value: string) => !value.trim();

export const isValidPassword = (password: string) => password.length >= 6;