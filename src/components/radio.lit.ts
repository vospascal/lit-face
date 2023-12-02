import FormControl, { InputType } from "../form-control/FormControl";

import { LitElement, PropertyValueMap, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { live } from "lit/directives/live.js";

import emit from "./emit"

import { requiredValidatorRadio } from "./validation-rules"

const SPACE = 'Space';
const ENTER = 'Enter'
const ARROW_LEFT = 'ArrowLeft';
const ARROW_UP = 'ArrowUp';
const ARROW_RIGHT = 'ArrowRight';
const ARROW_DOWN = 'ArrowDown';

@customElement('my-radio')
export class MyRadio extends FormControl {
  //** @private */
  inputType: InputType = "radio";


  constructor(...args: any[]) {
    super(...args);
    this.addEventListener?.('keydown', this.#onKeydown);
    this.addEventListener?.('click', this.#onClick);
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

  static formControlValidationGroup = true;
  static formControlValidators = [requiredValidatorRadio];

  @property({ type: String }) value?: string;
  @property({ type: String }) name?: string;
  @property({ type: Boolean }) disabled?: boolean = false;
  @property({ type: Boolean }) readonly?: boolean = false;
  @property({ type: Boolean }) checked?: boolean = false;
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
      <input
          type="radio"
          .value=${this.value}
          .checked=${live(this.checked)}
          name=${this.name}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          aria-checked=${this.checked}
          aria-valid=${this.validity.valid}
          @change="${this.#onChange}"
      />
      <span>${JSON.stringify(validationStatus)}</span>
    `
  }



  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    super.formResetCallback()
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
    if (this.checked) return

    this.checked = true
    emit(this, "change", this.checked);
    if (this.checked) {
      this.setValue(this.value);
    } else {
      this.setValue("");
    }
  }

  #selectPrevious(event: KeyboardEvent) {
    console.log('selectPrevious')
    event.preventDefault()
  }

  #selectNext(event: KeyboardEvent) {
    console.log('selectNext')
    event.preventDefault()
  }

  #onKeydown(event: KeyboardEvent) {
    switch (event.code) {
      case SPACE:
        this.#onSpaceCheck(event)
        break
      case ENTER:
        this.#onEnterSubmit(event);
        break
      case ARROW_LEFT:
      case ARROW_UP:
        this.#selectPrevious(event)
        break
      case ARROW_RIGHT:
      case ARROW_DOWN:
        this.#selectNext(event)
        break
    }
  }

  #onClick(event: Event) {
    if (this.checked || this.disabled) return
    this.checked = true
    emit(this, "change", this.checked);
    this.setValue(this.value);
    this.uncheckSiblings()
  }

  #onChange(event: Event) {
    if (this.checked) return
    this.checked = true
    emit(this, "change", this.checked);
    this.setValue(this.value);
    this.uncheckSiblings()
  }


  uncheckSiblings() {
    this.getRootNode().querySelectorAll(`my-radio[name="${this.name}"]`).forEach((item => {
      // set checked property to false
      item !== this && (item.checked = false)
    }))
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
    // if checked prop has changed broadcast right value
    if (changedProperties.has('checked')) {
      this.internals.states[!!this.checked ? 'add' : 'delete']('--checked');
      this.setValue(this.checked ? this.value : null)
      this.setAttribute('aria-checked', this.checked ? "true" : "false")
    }
  }


}

