import { FormValue, SyncValidator } from "../form-control";

function numCharacters(number: number): string {
  if (number === 1) {
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

export const requiredValidatorChecked: SyncValidator = {
  attribute: "required",
  key: "valueMissing",
  message() {
    return "Please tick this box if you want to proceed.";
  },
  isValid({ required, checked }: HTMLElement & { required: boolean; checked: boolean }, value: FormValue): boolean {
    return !required || (required && checked);
  },
};

export const requiredValidatorRadio: SyncValidator = {
  attribute: 'required',
  key: 'valueMissing',
  message: 'Please select an item',
  isValid(instance: HTMLElement & { checked: boolean, required: boolean }, value:FormValue) {
    const rootNode = instance.getRootNode();
    const selector = `${instance.localName}[name="${instance.getAttribute('name')}"]`;
    const group = Array.from(rootNode.querySelectorAll(selector));

    const isChecked = group.some((instance) => instance.checked);
    const isRequired = group.some(instance => instance.required);

    if (isRequired && !isChecked) {
      return false;
    }

    return true;
  }
}


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



export const maxLengthValidator: SyncValidator = {
  attribute: 'maxlength',
  key: 'tooLong',
  message({ maxLength }: HTMLElement & { maxLength: number }, value: FormValue) {
    const _value = value as string || '';
    return `Please use no more than ${maxLength} characters (you are currently using ${_value.length} characters).`;
  },
  isValid(
    instance: HTMLElement & { maxLength: number },
    value: string
  ): boolean {
    /** If maxLength isn't set, this is valid */
    if (!instance.maxLength) {
      return true;
    }

    if (!!value && instance.maxLength < value.length) {
      return false;
    }

    return true;
  }
};

export const textareaLengthValidator: SyncValidator = {
  ...maxLengthValidator,
  isValid(instance: HTMLElement & { validationTarget: HTMLTextAreaElement }) {
    if (instance.validationTarget && instance.getAttribute("maxlength")) {
      return Number(instance.getAttribute("maxlength")) >= instance.validationTarget.value.length;
    }
    return true;
  },
};