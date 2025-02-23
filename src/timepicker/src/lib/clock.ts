import { Component, ChangeDetectionStrategy, ViewEncapsulation, model, input, computed, effect, signal, afterRender } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RkTimepickerDial } from './timepicker-dial';
import { RkTimepickerInputLabel } from './timepicker-input-label';

@Component({
  selector: 'rk-clock',
  exportAs: 'rkClock',
  imports: [RkTimepickerInputLabel, NgClass, RkTimepickerDial, MatButton, MatIconButton, MatIcon],
  host: {
    'class': 'rk-timepicker',
    '[class.rk-timepicker-landscape]': 'isLandscape()',
    '[class.rk-timepicker-editable]': 'editable()',
  },
  template: `
    <div class="rk-timepicker-container" [ngClass]="{ 'rk-timepicker-container-hide': !load() }">
      <span class="rk-timepicker-headline">{{ headline() }}</span>
      <rk-timepicker-input-label [(time)]="value" [inputLabels]="inputSupportLabels()" [(editable)]="editable" [(format)]="format" [(period)]="period" [(selected)]="selected"></rk-timepicker-input-label>
      <rk-timepicker-dial  [ngClass]="{ 'rk-dial-closed': editable()}" [(time)]="value" [(format)]="format" [(period)]="period" [(selected)]="selected"></rk-timepicker-dial>
      <div class="rk-timepicker-footer">
        <button class="rk-timepicker-mode-button" (click)="changeMode()" mat-icon-button>
          @if (editable()) {
            <mat-icon>schedule</mat-icon>
          } @else {
            <mat-icon>keyboard</mat-icon> 
          }
        </button>
      </div>
    </div>
  `,
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RkClock {
  value= model<Date | null>(null, {alias: 'time'});
  selected =  model<string>('hours');
  format = model('24h');
  period = model<string>('AM');
  editable = model(false);
  orientation  = model<string>('portrait');
  inputSupportLabels = input<string[]>(['Hour', 'Minute'], {alias: 'inputLabels'});
  _headline = input<string[]>(['Enter time', 'Select time'], {alias: 'headline'});

  readonly  load = signal(false);

  readonly isLandscape = computed(() => {
    return this.orientation() === 'landscape';
  });

  readonly headline = computed(() => {
      const editable = this.editable();
      const labels = this._headline();
      return editable ? labels[0] : labels[1];
  });

  constructor() {
    effect(() => {
      const value = this.value();
      if(!value) {
        this.value.set(new Date());
      };
    });

    afterRender(() => {
      this.load.set(true);
    });
  }

  changeMode() {
    this.editable.set(!this.editable());
  }
}
