import FormControl, { InputType } from "../form-control/FormControl";

import { LitElement, PropertyValueMap, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { live } from "lit/directives/live.js";

import emit from "./emit"

import { requiredValidatorChecked } from "./validation-rules"


@customElement('my-checkbox')
export class MyCheckbox extends FormControl {
  //** @private */
  inputType: InputType = "text";

  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static styles = css`
      :host(:--invalid:--touched:not(:focus)) input {
        outline: 2px dashed red !important;
      }
      :host(:--valid:--touched) input {
        outline: 2px dashed green!important;
      }
    `;

  static formControlValidators = [requiredValidatorChecked];

  @property({ type: String }) value?: string = "on";
  @property({ type: String }) name?: string;
  @property({ type: Boolean }) disabled?: boolean = false;
  @property({ type: Boolean }) readonly?: boolean = false;
  @property({ type: Boolean, reflect: true }) checked?: boolean = false;
  @property({ type: Boolean }) indeterminate?: boolean = false;
  @property({ type: Boolean }) required?: boolean = false;


  /** @private true */
  @query("input") checkbox?: HTMLInputElement;

  override get validationTarget(): HTMLInputElement {
    return this.checkbox as HTMLInputElement;
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

  // override shouldFormValueUpdate(): boolean {
  //   return this.checked;
  // }


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
            @focus=${this.#onFocus}
            @blur=${this.#onBlur}
            @change=${this.#onChange}
            @keydown=${this.#onKeydown}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            .checked=${live(this.checked)}
            aria-checked=${this.checked}
            aria-valid=${this.validity.valid}
        />
        `
  }



  #onFocus = () => {
    emit(this, "focus");
  };

  #onBlur = () => {
    emit(this, "blur");
  };

  #onChange = (event: Event) => {
    console.log('onClick')
    this.checked = !this.checked;
    emit(this, "click", this.checked);
    this.#setChecked()
  };

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = this.getAttribute("value");
    this.checked = this.getAttribute("checked");
  }

  setCustomValidity(message: string) {
    this.internals.setValidity({ customError: !!message, valid: !message }, message);
  }

  #onEnterSubmit(event: KeyboardEvent) {
    if (event.key !== "Enter") return;

    const form = this.internals.form;
    if (form.requestSubmit) {
      form.requestSubmit();
    } else {
      form.submit();
    }
  }

  #onSpaceCheck(event: KeyboardEvent) {
    if (event.code !== "Space") {
      return;
    }
    this.checked = !this.checked
    emit(this, "change", this.checked);
    this.#setChecked()
  }
  
  #onKeydown(event: KeyboardEvent) {
    event.stopImmediatePropagation()
    console.log('onKeydown')
    this.#onEnterSubmit(event);
    this.#onSpaceCheck(event)
  }

  #setChecked(){
    if(this.checked){
      this.setValue(this.value);
    } else {
      this.setValue("");
    }
  }


  public formAssociatedCallback() {
    // console.log(this.internals.form)
    // console.log(this.form)
    // debugger
    // if (this.internals.form) {
    //   // This relies on the form begin a 'uui-form':
    //   if (this.internals.form.hasAttribute('submit-invalid')) {
    //     this.pristine = false;
    //   }

    //   this.internals.form.addEventListener('submit', () => {
    //     console.log('submit')
    //     this.pristine = false;
    //   });
    // }
  }
}

//ria-invalid