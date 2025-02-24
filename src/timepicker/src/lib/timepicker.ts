import { Component, ChangeDetectionStrategy, ViewEncapsulation, model, input, computed, effect, signal, output, afterRender, InputSignal, viewChild, TemplateRef, OutputEmitterRef, inject, untracked, Signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Dialog, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { RkTimepickerDial } from './timepicker-dial';
import { RkTimepickerInputLabel } from './timepicker-input-label';
import { RkTimepickerInput } from './timepicker-input';

@Component({
  selector: 'rk-timepicker',
  exportAs: 'rkTimepicker',
  imports: [RkTimepickerInputLabel, NgClass, DialogModule, RkTimepickerDial, MatButton, MatIconButton, MatIcon],
  host: {
    '[class.rk-timepicker-landscape]': 'isLandscape()',
    '[class.rk-timepicker-editable]': 'editable()',
    '(keydown)': '_handleKeydown($event)',
  },
  template: `
    <ng-template #panelTemplate>
      <div class="rk-timepicker rk-timepicker-panel">
        <div class="rk-timepicker-container" [ngClass]="{ 'rk-timepicker-container-hide': !load() }">
          <span class="rk-timepicker-headline">{{ headline() }}</span>
          <rk-timepicker-input-label [(time)]="currentTime" [inputLabels]="_inputSupportLabels()" [(editable)]="editable" [(format)]="format" [(period)]="period" [(selected)]="selected"></rk-timepicker-input-label>
          <rk-timepicker-dial  [ngClass]="{ 'rk-dial-closed': editable(), 'rk-dial-animated': animated()}" [(time)]="currentTime" [(format)]="format" [(period)]="period" [(selected)]="selected"></rk-timepicker-dial>
          <div class="rk-timepicker-footer">
            <button class="rk-timepicker-mode-button" (click)="changeMode()" mat-icon-button>
              @if (editable()) {
                <mat-icon>schedule</mat-icon>
              } @else {
                <mat-icon>keyboard</mat-icon> 
              }
            </button>
            <div class="rk-timepicker-actions">
              <button mat-button (click)="onCancel()">{{_actions()[0]}}</button>
              <button mat-button (click)="onConfirm()">{{_actions()[1]}}</button>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RkTimepicker {
  selected =  model<string>('hours');
  format = model('12h');
  period = model<string>('AM');
  editable = model(false);
  orientation  = model<string>('portrait');
  
  _inputSupportLabels = input<string[]>(['Hour', 'Minute'], {alias: 'inputLabels'});
  _headline = input<string[]>(['Enter time', 'Select time'], {alias: 'headline'});
  _actions = input<string[]>(['Cancel', 'OK'], {alias: 'actions'});
  /** Whether the timepicker is currently disabled. */
  readonly disabled: Signal<boolean> = computed(() => !!this._input()?.disabled());
  
  readonly defaultTime: InputSignal<Date | null> = input<Date | null>(null,{alias: 'time'});
  readonly  load = signal(false);
  
  readonly isLandscape = computed(() => {
    return this.orientation() === 'landscape';
  });
  
  readonly headline = computed(() => {
    const editable = this.editable();
    const labels = this._headline();
    return editable ? labels[0] : labels[1];
  });
  
  
  protected _panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');
  private _dialogRef = signal<DialogRef<Date | null> | null>(null);
  
  private _input = signal<RkTimepickerInput | null>(null);
  private _isOpen = signal(false);

  currentTime = signal<Date | null>(null);
  animated = signal(false);
  
  /** Emits when the timepicker is opened. */
  readonly opened: OutputEmitterRef<void> = output();
  /** Emits when the timepicker is closed. */
  readonly closed: OutputEmitterRef<void> = output();

  readonly selectedTime: OutputEmitterRef<Date> = output();
  
  private _dialog = inject(Dialog);

  constructor() {
    effect(() => {
      const value = this.defaultTime();
      if(!value) {
        this.currentTime.set(new Date());
      } else {
        this.currentTime.set(value);
      }
    });

    effect(() => {
      const editable = this.editable();
      untracked(() => {
        this.animated.set(true);
      })
    })

    afterRender(() => {
      this.load.set(true);
    });
  }

  /** Opens the timepicker. */
  open(): void {
    const input = this._input();

    if (!input) {
      return;
    }

    if (this._isOpen()) {
      return;
    }

    this.currentTime.set(input.value());
    this.animated.set(false);
    this._isOpen.set(true);
    this.opened.emit();
    
    const dialogRef = this._dialog.open<Date | null>(this._panelTemplate(), {
      width: '328px',
    });

    this._dialogRef.set(dialogRef);

    dialogRef.closed.subscribe(result => {
      if(result) {
        this._input()?.value.set(result);
        this.selectedTime.emit(result);
        input.simulateEnter();
      }
      this._isOpen.set(false);
      this.closed.emit();
      this.selected.set('hours');
      input.focus();
    });
  }

 /** Registers an input with the timepicker. */
  registerInput(input: RkTimepickerInput): void {
    const currentInput = this._input();

    if (currentInput && input !== currentInput ) {
      console.warn('RkTimepicker can only be registered with one input at a time');
    }

    this._input.set(input);
  }

  private _handleKeydown(event: KeyboardEvent): void {
    const keyCode = event.key;
    if (keyCode === 'Enter') {
      event.preventDefault();
      this.onConfirm();
    } else if (keyCode === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }
  }


  changeMode() {
    this.editable.set(!this.editable());
  }

  
  onConfirm() {
    this._dialogRef()?.close(this.currentTime());
  }

  onCancel() {
    this._dialogRef()?.close();
  } 
}
