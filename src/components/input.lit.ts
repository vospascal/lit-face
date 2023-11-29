import {FormControlMixin} from "../form-control";

import { LitElement, PropertyValueMap, css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

import emit from "./emit"

import {requiredValidator, minLengthValidator, patternValidator} from "./validation-rules"


@customElement('my-input')
export class MyInput extends FormControlMixin(LitElement) {
    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    static formControlValidators = [requiredValidator, minLengthValidator, patternValidator];

    @property({type: String}) value?: string;
    @property({type: String}) name?: string;
    @property({type: Boolean}) disabled = false
    @property({type: Boolean}) readonly = false

    @property({ type: Boolean }) required: boolean = false;
    @property() pattern?: string;


    @property({type: String}) placeholder?: string;

    @property({type: Boolean}) dirty = false;

      /** @private true */
    @query("input") input?: HTMLInputElement;

    override get validationTarget(): HTMLInputElement {
        return this.input as HTMLInputElement;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (this.disabled) {
          this.setValue(null);
          return;
        }
    
        if (this.hasAttribute("value")) {
          this.setValue(this.value);
        }
  
    }

    render() {
        return html`<input
            type="text"
            .value=${this.value}
            name=${this.name}
            @focus=${this.#onFocus}
            @blur=${this.#onBlur}
            @input=${this.#onInput}
            @change=${this.#onChange}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            placeholder=${this.placeholder}
            required=${this.required}
            pattern=${this.pattern}
        />`
    }



  #onFocus = () => {
    emit(this, "focus");
  };

  #onBlur = () => {
    emit(this, "blur");
    this.dirty = true;
    this.setValue(this.value);
  };

  #onInput = (event: Event) => {
    event.stopPropagation();
    this.value = this.input!.value;
    emit(this, "input", this.value);
    this.dirty = true;
    this.setValue(this.value);
  };

  #onChange = (event: Event) => {
    event.stopPropagation();
    this.value = this.input!.value;
    emit(this, "change", this.value);
    this.dirty = true;
    this.setValue(this.value);
  };

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = this.getAttribute("value");
    this.dirty = false;
  }

  setCustomValidity(message: string) {
    this.internals.setValidity({ customError: !!message, valid: !message }, message);
  }

  onEnterSubmit(event: KeyboardEvent) {
    if (event.key !== "Enter") return;

    const form = this.internals.form;
    if (form.requestSubmit) {
      form.requestSubmit();
    } else {
      form.submit();
    }
  }
}

//ria-invalid