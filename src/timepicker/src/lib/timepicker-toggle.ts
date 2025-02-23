import { booleanAttribute, Component, computed, input, InputSignal, InputSignalWithTransform } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { RkTimepicker } from './timepicker';

@Component({
  selector: 'rk-timepicker-toggle',
  imports: [MatIconButton],
  template: `
    <button mat-icon-button type="button" [disabled]="_isDisabled()" (click)="_open($event)">
      <ng-content select="[rkTimepickerToggleIcon]">
        <svg
          class="rk-timepicker-toggle-default-icon"
          height="24px"
          width="24px"
          viewBox="0 -960 960 960"
          fill="currentColor"
          focusable="false"
          aria-hidden="true">
          <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"/>
        </svg>
      </ng-content>
    </button>
  `,
  styles: ``
})
export class RkTimepickerToggle {
  readonly timepicker: InputSignal<RkTimepicker> = input.required<RkTimepicker>({
    alias: 'for',
  });

  /** Whether the toggle button is disabled. */
  readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
    alias: 'disabled',
  });

  protected _isDisabled = computed(() => {
    const timepicker = this.timepicker();
    return this.disabled() || timepicker.disabled();
  });

  /** Opens the connected timepicker. */
  protected _open(event: Event): void {
    if (this.timepicker() && !this._isDisabled()) {
      this.timepicker().open();
      event.stopPropagation();
    }
  }
}