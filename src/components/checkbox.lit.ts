import FormControl, { InputType } from "../form-control/FormControl";

import { LitElement, PropertyValueMap, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { live } from "lit/directives/live.js";

import emit from "./emit"

import { requiredValidatorChecked } from "./validation-rules"

const SPACE = 'Space';
const ENTER = 'Enter'

@customElement('my-checkbox')
export class MyCheckbox extends FormControl {
  //** @private */
  inputType: InputType = "checkbox";


  constructor(...args: any[]) {
    super(...args);
    this.addEventListener?.('keydown', this.#onKeydown);
  }

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

    :host(:--checked) input { 
      outline: 2px solid green!important;
      outline-offset: 2px;
    }
  `;

  static formControlValidators = [requiredValidatorChecked];

  @property({ type: String }) value?: string = "on";
  @property({ type: String }) name?: string;
  @property({ type: Boolean }) disabled?: boolean = false;
  @property({ type: Boolean }) readonly?: boolean = false;
  @property({ type: Boolean }) checked?: boolean = false;
  @property({ type: Boolean }) indeterminate?: boolean = false;
  @property({ type: Boolean }) required?: boolean = false;


  /** @private true */
  @query("input") checkbox?: HTMLInputElement;

  override get validationTarget(): HTMLInputElement {
    return this.checkbox as HTMLInputElement;
  }

  shouldFormValueUpdate(): boolean {
    return !!this.checked;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (this.disabled) {
      this.setValue(null);
      return;
    }

    if (this.hasAttribute("value") && !this.isCheckable()) {
      this.setValue(this.value || "");
    }

    if (this.hasAttribute("value") && this.isCheckable()) {
      if (this.checked) {
        this.setValue(this.value || "on");
      } else {
        this.setValue(null);
      }
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
        <span>${JSON.stringify(validationStatus)}</span>
        <input
            type="checkbox"
            .value=${this.value}
            name=${this.name}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            .checked=${live(this.checked)}
            .indeterminate="${this.indeterminate}"
            @change="${this.#onChange}"
        />
        `
  }



  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  resetFormControl() {
    // The checked property does not reflect, so the original attribute set by
    // the user is used to determine the default value.
    this.checked = this.hasAttribute('checked');
  }

  setCustomValidity(message: string) {
    this.internals.setValidity({ customError: !!message, valid: !message }, message);
  }

  #onEnterSubmit(event: KeyboardEvent) {
    const form = this.internals.form;
    if (form.requestSubmit) {
      form.requestSubmit();
    } else {
      form.submit();
    }
  }

  #onSpaceCheck(event: KeyboardEvent) {
    event.preventDefault()
    this.checked = !this.checked
    emit(this, "change", this.checked);
    if (this.checked) {
      this.setValue(this.value);
    } else {
      this.setValue("");
    }
  }

  #onKeydown(event: KeyboardEvent) {
    switch (event.code) {
      case SPACE:
        this.#onSpaceCheck(event)
        break
      case ENTER:
        this.#onEnterSubmit(event);
        break
    }
  }

  #onChange(event: Event) {
    this.checked = !this.checked
    emit(this, "change", this.checked);
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
    if (changedProperties.has('checked')) {
      this.internals.states[!!this.checked ? 'add' : 'delete']('--checked');
      this.setAttribute('aria-checked', this.checked ? "true" : "false")
    }
  }

}

// todo: fix intermediate state