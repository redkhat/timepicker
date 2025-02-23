import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input, InputSignal, InputSignalWithTransform, model, ModelSignal, Renderer2, Signal, signal } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { RkTimepicker } from './timepicker';
import { secondsToDate, timeToSecondsi18n as timeToSeconds } from './utils';

@Directive({
  selector: 'input[rkTimepicker]',
  exportAs: 'rkTimepickerInput',
  host: {
    'class': 'rk-timepicker-input',
    'type': 'text',
    '(input)': '_handleInput($event.target.value)',
    '(blur)': '_handleBlur()',
    '(keydown)': '_handleKeydown($event)',
    '[disabled]': 'disabled()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RkTimepickerInput,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: RkTimepickerInput,
      multi: true,
    },
    {
      provide: MAT_INPUT_VALUE_ACCESSOR,
      useExisting: RkTimepickerInput,
    },
  ]
})
export class RkTimepickerInput implements ControlValueAccessor, Validator {
  private _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  
  /** Necessary for ControlValueAccessor implementation */
  private _onChange: ((value: any) => void) | undefined;
  private _onTouched: (() => void) | undefined;
  private _accessorDisabled = signal(false);
  private _validatorOnChange: (() => void) | undefined;

  /** Current value of the input. */
  readonly value: ModelSignal<Date | null> = model<Date | null>(null);
  private _tempDateSafe = signal<Date | null>(null);
  
  /** Timepicker that the input is associated with. */
  readonly timepicker: InputSignal<RkTimepicker> = input.required<RkTimepicker>({
    alias: 'rkTimepicker',
  });
  /** Whether the input is disabled. */
  readonly disabled: Signal<boolean> = computed(
    () => this.disabledInput() || this._accessorDisabled(),
  );
  /**
   * Whether the input should be disabled through the template.
   */
  readonly disabledInput: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
    alias: 'disabled',
  });
  
  constructor() {
    this._registerTimepicker();
  }

  private _updateModelValue() {
    const value = this.value();
    if(!value) {
      this._validatorOnChange?.();
      return
    }
    this._onChange?.(value);
  }
  
  private _validateTimeOrNull(value: string | Date | null) {
    if (value === null || value instanceof Date) {
      this.value.set(value);
      return;
    }
    const validTime = timeToSeconds(value);
    const time = validTime ? secondsToDate(validTime) : null;
    if(!time) {
      this.value.set(null);
    } else {
      const newDate = new Date(this._tempDateSafe() ?? new Date());
      newDate.setHours(time.getHours(), time.getMinutes());
      this.value.set(newDate);
    }
  }
  
   private _updateInputValue() {
    if (this.value() !== null) {
      this._renderer.setProperty(this._elementRef.nativeElement, 'value', this.value()?.toLocaleTimeString([],{ hour: "2-digit", minute: "2-digit" }));
    }
  }

  /** Handles the `input` event. */
  protected _handleInput(value: string) {
    this._validateTimeOrNull(value);
    this._validatorOnChange?.();
  }

  /** Handles the `keydown` event. */
  protected _handleKeydown(event: KeyboardEvent) {
    if (['Enter', 'Escape', 'Tab'].includes(event.code)) {
      this._updateModelValue();
      this._updateInputValue();
    }
  }

  simulateEnter() {
    this._handleKeydown({ code: 'Enter' } as KeyboardEvent);
  }

  /** Handles the `blur` event. */
  protected _handleBlur() {
    this._onTouched?.();
    this._updateModelValue();
    this._updateInputValue();
  }

  /** Focuses the input. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** Implemented as a part of ControlValueAccessor. */
  writeValue(value: any): void {
    if(value instanceof Date) {
      this._tempDateSafe.set(value);
      this.value.set(value);
      this._updateInputValue();
    } else {
      this._validateTimeOrNull(value);
      this._updateInputValue();
    }
  }
   /** Implemented as a part of ControlValueAccessor. */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }
  /** Implemented as a part of ControlValueAccessor. */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: any): void {
    this._accessorDisabled.set(isDisabled);
  }

  // implemented as a part of Validator
  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || this.value() == null) {
      return { invalidTimeFormat: true };
    }
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  /** Sets up the logic that registers the input with the timepicker. */
  private _registerTimepicker(): void {
    effect(() => {
      const timepicker = this.timepicker();
      timepicker.registerInput(this);
      timepicker.closed.subscribe(() => this._onTouched?.());
    });
  }
}
