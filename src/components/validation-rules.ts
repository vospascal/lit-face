import { FormValue, SyncValidator } from "../form-control";

function numCharacters(number: number): string {
    if(number === 1){
        return 'one character'
    }
    return `${number} characters`
  }
  

export const requiredValidator: SyncValidator = {
    attribute: "required",
    key: "valueMissing",
    message() {
      return 'Please fill in this field';
    },
    isValid({ required }: HTMLElement & { required: boolean }, value: FormValue): boolean {
      return !required || !!value;
    },
  };
  
  export const minLengthValidator: SyncValidator = {
    attribute: "minlength",
    key: "tooShort",
    message({ minLength }: HTMLElement & { minLength: number }, value: FormValue) {
      const actualLength = (value as string).length;
      const actualChars = numCharacters(actualLength);
      const minChars = numCharacters(minLength);
      return `tooShort at least ${minChars} currently ${actualChars}`;
    },
    isValid({ minLength }: HTMLElement & { minLength: number }, value: string): boolean {
      return !value || !minLength || value.length >= minLength;
    },
  };
  
  export const patternValidator: SyncValidator = {
    attribute: "pattern",
    key: "patternMismatch",
    message() {
      return "Please match the format requested";
    },
    isValid({ pattern }: HTMLElement & { pattern: string }, value: string): boolean {
      return !value || !pattern || !!value.match("^" + pattern + "$");
    },
  };