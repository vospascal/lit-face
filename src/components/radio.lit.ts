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
    :host(:--invalid:--touched:focus){
      background:#e6adad;
    }
    :host(:--valid:--touched:focus){
      background:#ade6b4;
    }
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

    if (this.hasAttribute("value")) {
      if (this.checked) {
        this.setValue(this.value || "on");
      } else {
        // important to set this to null else it doesnt validate
        this.setValue(null);
      }
    }
  }

  // todo: fix focus

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
    
    if (this.disabled) {
      this.setAttribute('aria-disabled', 'true');
      this.setAttribute('tabindex', "-1");
    } else if(this.#findFirstNonDisabledOrChecked() === this){
      this.removeAttribute('aria-disabled');
      this.removeAttribute('tabindex');
    }
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
      this.setValue(null);
    }
    this.uncheckSiblings()
  }

  #selectPrevious(event: KeyboardEvent) {
    const prevNode = this.#findNextEnabledElement(-1)
    // this.getRootNode().querySelectorAll(`my-radio[name="${this.name}"]`).forEach((item => {
    Array.from(this.formValidationGroup).forEach((item => {
      item !== prevNode ? (item.checked = false) : (item.checked = true)
    }))
    
    prevNode?.focus()

    emit(this, "change", this.checked);
    if (this.checked) {
      this.setValue(this.value);
    } else {
      this.setValue(null);
    }

    event.preventDefault()
  }

  #selectNext(event: KeyboardEvent) {
    const nextNode = this.#findNextEnabledElement(1)
    // this.getRootNode().querySelectorAll(`my-radio[name="${this.name}"]`).forEach((item => {
    Array.from(this.formValidationGroup).forEach((item => {
      item !== nextNode ? (item.checked = false) : (item.checked = true)
    }))

    nextNode?.focus()

    emit(this, "change", this.checked);
    if (this.checked) {
      this.setValue(this.value);
    } else {
      this.setValue(null);
    }

    event.preventDefault()
  }

  #findNextEnabledElement(direction: number = 1): MyRadio | null {
    const formValidationGroupArray = Array.from(this.formValidationGroup);
    const origin = Array.from(this.formValidationGroup).findIndex(x => x.checked)
    const len = formValidationGroupArray.length;
    let i = 1;
  
    while (i < len) {
      let checkIndex = (origin + i * direction) % len;
  
      if (checkIndex < 0) {
        checkIndex += len;
      }
  
      const nextElement = formValidationGroupArray[checkIndex];
  
      if (!nextElement.disabled && nextElement !== this.checked) {
        return nextElement;
      }
  
      i++;
    }
  
    return null;
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

  #findFirstNonDisabledOrChecked(): MyRadio | null {
    const checkedItem = Array.from(this.formValidationGroup).find(item => item.checked)
    if(checkedItem){
      return checkedItem
    }
    const firstNotDisabled = Array.from(this.formValidationGroup).find(item => !item.disabled)
    return firstNotDisabled;
  }

  protected override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      if (this.disabled) {
        this.setAttribute('aria-disabled', 'true');
        this.setAttribute('tabindex', "-1");
      } else if(this.#findFirstNonDisabledOrChecked() === this){
        this.removeAttribute('aria-disabled');
        this.removeAttribute('tabindex');
      }
    }
    // if checked prop has changed broadcast right value
    if (changedProperties.has('checked')) {
      this.internals.states[!!this.checked ? 'add' : 'delete']('--checked');
      this.setValue(this.checked ? this.value : null)
      this.setAttribute('aria-checked', this.checked ? "true" : "false")
      if(this.checked){
        this.removeAttribute('tabindex')
      } else if(this.#findFirstNonDisabledOrChecked() === this) {
        this.removeAttribute('tabindex')
      }else {
        this.setAttribute('tabindex','-1')
      }
    }
  }


}


