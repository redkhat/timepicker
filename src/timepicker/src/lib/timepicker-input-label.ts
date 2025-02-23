import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, model, ModelSignal, signal, untracked, viewChild, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { formatTimeValue, splitDate, validateTimeValue } from './utils';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'rk-timepicker-input-label',
  imports: [NgClass, MatRippleModule, FormsModule],
  host: {
    'class': 'rk-time-input-field',
  },
  template: `
    <div class="rk-time-input-label-container">
      <div class="rk-time-selector-container" matRipple [ngClass]="{'rk-time-selector-container-selected': selected() === 'hours'}" (click)="selectedChange('hours')">
        @if (!editable()) {
          {{value().hours.toString().padStart(2, '0')}}
        } @else {
          <input type="text" maxlength="2" #inputH [value]="hours()" (focus)="selectedChange('hours')" (input)="onHoursInput($event)" (blur)="onHoursBlur()" name="hours">
        }
      </div>
      @if (editable()) {
        <span class="rk-time-input-support-label">{{inputSupportLabels()[0]}}</span>
      }
    </div>
    <div class="rk-time-divider">:</div>
    <div class="rk-time-input-label-container">
      <div class="rk-time-selector-container" matRipple [ngClass]="{'rk-time-selector-container-selected': selected() === 'minutes'}" (click)="selectedChange('minutes')">
        @if (!editable()) {
          {{value().minutes.toString().padStart(2, '0')}}
        } @else {
          <input type="text" maxlength="2" #inputM [value]="minutes()" (focus)="selectedChange('minutes')" (input)="onMinutesInput($event)" (blur)="onMinutesBlur()" name="minutes">
        }
      </div>
      @if (editable()) {
        <span class="rk-time-input-support-label">{{inputSupportLabels()[1]}}</span>
      }
    </div>
    @if (format() === '12h') {
      <div class="rk-period-selector-container">
        <div class="rk-period-selector" matRipple [ngClass]="{'rk-period-selector-selected': period() === 'AM'}" (click)="periodSelector('AM')">AM</div>
        <div class="rk-period-selector" matRipple [ngClass]="{'rk-period-selector-selected': period() === 'PM'}" (click)="periodSelector('PM')">PM</div>
      </div>
    }
  `,
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RkTimepickerInputLabel {
  currentTime: ModelSignal<Date | null> = model.required<Date | null>({alias: 'time'});
  selected = model('hours');
  period = model('AM');
  format = model('12h');
  editable = model(false);

  hours = signal<string>('');
  minutes = signal<string>('');

  inputSupportLabels = input<string[]>(['Hour', 'Minute'], {alias: 'inputLabels'});
  inputHours = viewChild<ElementRef<HTMLInputElement>>('inputH');
  inputMinutes = viewChild<ElementRef<HTMLInputElement>>('inputM');

  readonly value = computed(() => {
    const date = this.currentTime();
    const format = this.format();
    if (date) {
      const { hours, minutes } = splitDate(date);
      if (format === '12h') {
        return { hours: hours > 12 ? hours - 12 : hours === 0 ? 12 : hours, minutes };
      }
      return { hours, minutes };
    }
    return { hours: 0, minutes: 0 };
  });

  constructor() {
    effect(() => {
      const editable = this.editable();
      const selected = this.selected();
      if (editable) {
        if (selected=== 'hours') {
          this.inputHours()?.nativeElement.focus();
        } else if (selected === 'minutes') {
          this.inputMinutes()?.nativeElement.focus();
        }
      }
    });

    effect(() => {
      const value = this.value();
      untracked(() => {
        this.onHoursInput(value.hours.toString().padStart(2, '0'));
        this.onMinutesInput(value.minutes.toString().padStart(2, '0'));
      })
    })
  }

  onHoursInput(event: Event|string): void {
    const input = this.inputHours()?.nativeElement;
    const value = typeof event === 'string' ? event : (<HTMLInputElement>event.target)?.value;
    const max = this.format() === '24h' ? 23 : 12;
    const validatedValue = validateTimeValue(value, max);

    if (input &&input.value !== validatedValue) {
      input.value = validatedValue;
    }
    this.hours.set(validatedValue);

  }
  
  onMinutesInput(event: Event|string): void {
    const input = this.inputMinutes()?.nativeElement;
    const value =  typeof event === 'string' ? event : (<HTMLInputElement>event.target)?.value;
    const validatedValue = validateTimeValue(value, 59);

    if (input &&input.value !== validatedValue) {
      input.value = validatedValue;
    }

    this.minutes.set(validatedValue);
  }

  onHoursBlur(): void {
    const defaultHour = this.format() === '24h' ? '00' : '01';
    const formattedValue = formatTimeValue(this.hours(), defaultHour);
    this.hours.set(formattedValue);
    this.updateModel();
  }

  onMinutesBlur(): void {
    const formattedValue = formatTimeValue(this.minutes(), '00');
    this.minutes.set(formattedValue);
    this.updateModel();
  }

  updateModel() {
    const tempDate = this.currentTime();
    if(tempDate) {
      const newDate = new Date(tempDate);
      let hoursN = Number(this.hours());
      const minutesN = Number(this.minutes());
      if (this.format() === '12h' && this.period() === 'PM') {
        hoursN = hoursN < 12 ? hoursN + 12 : hoursN;
      }
      newDate.setHours(hoursN);
      newDate.setMinutes(minutesN);
      this.currentTime.set(newDate);
    }
  }

  selectedChange(selected: string) {
    if (this.selected() === selected) {
      return;
    }
    this.selected.set(selected);
  }

  periodSelector(period: string) {
    if (this.period() === period) {
      return;
    }
    this.period.set(period);
  }
}