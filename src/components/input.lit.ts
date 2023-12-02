import FormControl, { InputType } from "../form-control/FormControl";

import { LitElement, PropertyValueMap, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

import emit from "./emit"

import { requiredValidator, minLengthValidator, patternValidator } from "./validation-rules"


@customElement('my-input')
export class MyInput extends FormControl {
  //** @private */
  inputType: InputType = "text";

  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static styles = css`
    :host(:--invalid:--touched:not(:focus)) input {
      outline: 2px dotted red;
      outline-offset: 2px;
    }
    :host(:--valid:--touched) input {
      outline: 2px dotted green;
      outline-offset: 2px;
    }
  `;

  static formControlValidators = [requiredValidator, minLengthValidator, patternValidator];

  @property({ type: String }) value?: string;
  @property({ type: String }) name?: string;
  @property({ type: Boolean }) disabled?: boolean = false;
  @property({ type: Boolean }) readonly?: boolean = false;
  @property({ type: Boolean }) required: boolean = false;
  @property({ type: String }) pattern?: string;
  @property({ type: String }) placeholder?: string;


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
    // the html template not in sync with this state

    const validationStatus = {
      dirty: this.dirty,
      pristine: this.pristine,
      touched: this.touched,
      untouched: !this.touched,
      valid: this.validity.valid,
      invalid: !this.validity.valid
    }
    // console.log(this.validity)
    // console.table(validationStatus)

    return html`
      <input
          type="text"
          .value=${this.value}
          name=${this.name}
          @focus=${this.#onFocus}
          @blur=${this.#onBlur}
          @input=${this.#onInput}
          @change=${this.#onChange}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          placeholder=${this.placeholder || nothing}
          required=${this.required || nothing}
          pattern=${this.pattern || nothing}
      />
      <span>${JSON.stringify(validationStatus)}</span>
    `
  }



  #onFocus = () => {
    emit(this, "focus");
  };

  #onBlur = () => {
    emit(this, "blur");
  };

  #onInput = (event: Event) => {
    event.stopPropagation();
    this.value = this.input!.value;
    emit(this, "input", this.value);
    this.setValue(this.value);
  };

  #onChange = (event: Event) => {
    event.stopPropagation();
    this.value = this.input!.value;
    emit(this, "change", this.value);
    this.setValue(this.value);
  };

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  resetFormControl(): void {
    this.value = this.getAttribute('value') || '';
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

  validationMessageCallback(): void {
    if (!this.validity.valid) {
      this.setAttribute('aria-invalid', 'true');
    } else {
      this.removeAttribute('aria-invalid');
    }
  }

  protected override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('disabled')) {
      if (this.disabled) {
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('aria-disabled');
      }
    }
  }

}
