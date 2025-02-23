import { Component, ChangeDetectionStrategy, ViewEncapsulation, ModelSignal, model, viewChild, ElementRef, Renderer2, DestroyRef, inject, computed, afterNextRender, effect, Injector, WritableSignal, signal, untracked } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, takeUntil, tap } from 'rxjs';

import { ClockIterable } from './utils/clock-iterable';
import { amPmTransform, detectTimeFormat, SimpleTime, splitDate } from './utils/time';
import { cubicBezier } from './utils/animation';
import { normalizeEvent, createPointerEvents, MouseTouchEvent } from './utils/events';
import { snapAngle, hoursToAngle, angleToHours, hours24ToAngle, minutesToAngle, angleToHours24, angleToMinutes } from './utils/angle';
import { HOURS_LABEL, HOURS_LABEL_24_P1, HOURS_LABEL_24_P2, MINUTES_LABEL } from './utils/constants';

@Component({
  selector: 'rk-timepicker-dial',
  host: {
    'class': 'rk-timepicker-dial',
  },
  imports: [],
  template: `	
    <div class="rk-timepicker-dial-container">
      <div #dial class="rk-label-container rk-dial-size">
      </div>
      <div #dial2 class="rk-cliped-label rk-dial-size">
      </div>
      <div #dialSelector class="rk-dial-selector"></div>
      <div class="rk-pivot-point"></div>
    </div>
  `,
  styles: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RkTimepickerDial {
  currentTime: ModelSignal<Date | null> = model.required<Date | null>({alias: 'time'});
  timeFormat: ModelSignal<string | null> = model<string | null>('12h', {alias: 'format'});
  selectedTime: ModelSignal<string | null> = model<string | null>('hours', {alias: 'selected'});
  period: ModelSignal<string> = model<string>('AM');

  readonly value = computed(() => {
      const date = this.currentTime();
      return date ? splitDate(date) : { hours: 0, minutes: 0 };
  });
  readonly format = computed(() => {
    const fm = this.timeFormat();
    return (fm && (fm === '24h' || fm === '12h')) ? fm : detectTimeFormat(new Date());
  });
  readonly selected = computed(() => {
    const selected = this.selectedTime();
    return selected === 'hours' || selected === 'minutes' ? selected : 'hours';
  });

  private _dial  = viewChild.required<ElementRef>('dial');
  private _clipedLabel  = viewChild.required<ElementRef>('dial2');
  private _dialSelector = viewChild.required<ElementRef>('dialSelector');

  private _elRef: ElementRef = inject(ElementRef);
  private _renderer: Renderer2 = inject(Renderer2);
  private _destroyRef: DestroyRef = inject(DestroyRef);
  private _injector = inject(Injector);
  private _document = inject(DOCUMENT);

  private _currentDial = signal(1);
  private _currentDegree: WritableSignal<number> = signal(0);
  private _loading = signal(false);
  private readonly _motion = 400;
  private readonly _radius = 128;
  private readonly _labelSize = 48;
  
  constructor() {
    afterNextRender(() => {
     this._fillBySelected(this.selected(), this.format());

    effect(() => {
      const selected = this.selected();
      const format = this.format();
      this._fillBySelected(selected, format);
      untracked(() => {
        const value = this.value();
        this.period.set(this.value().hours < 12 ? 'AM' : 'PM');
        this._currentDial.set(format === '24h'  && selected === 'hours' && value.hours >= 12 ? 2 : 1);
        this._handleInputsChange(value, format, selected);
      });

    }, { injector: this._injector});

    effect(() => {
      const value = this.value();
      untracked(() => {
        if(this._loading()) return;
        const format = this.format();
        const selected = this.selected();
        this.period.set(this.value().hours < 12 ? 'AM' : 'PM');
        this._currentDial.set(format === '24h'  && selected === 'hours' && value.hours >= 12 ? 2 : 1);
        this._handleInputsChange(value, format, selected, true);
      })
    }, { injector: this._injector});

    effect(() => {
      const period = this.period();
      untracked(() => {
        const currentTime = this.currentTime();
        if(period === null || currentTime === null) return;
        this.currentTime.set(amPmTransform(period, currentTime));
      })
    }, { injector: this._injector});

    const { start$, move$, end$ } = createPointerEvents(this._elRef.nativeElement);
    start$.pipe(
      tap((event) => this._onPointerEventInit(normalizeEvent(event))),
      switchMap(() => {
        return move$.pipe(
          takeUntil(end$.pipe(tap((event) => this._onPointerEventStop(normalizeEvent(event)))))
        );
      }),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(event => {
      const normalized = normalizeEvent(event);
      this._onPointerEventInit(normalized);
    })
    });
  }

  private _handleInputsChange(value: SimpleTime, format: string, selected: string, animate = true) {
    if(selected === 'hours') {
      const angle = format === '24h' ? hours24ToAngle(value.hours) : hoursToAngle(value.hours);
      if(animate) {
        this._rotateAnimation(this._currentDegree(), angle, this._motion, 2);
      } else {
        this._moveByAngle(angle, 2);
      }
      this._currentDegree.set(angle);
    } else {
      const angle = minutesToAngle(value.minutes);
      if(animate) {
        this._rotateAnimation(this._currentDegree(), angle, this._motion, 2);
      } else {
        this._moveByAngle(angle, 2);
      }
      this._currentDegree.set(angle);
    }
  }

  private _onPointerEventInit(event: MouseTouchEvent) {
    this._loading.set(true);
    this._moveByTouchClick(event, this._dial().nativeElement);
  }

  private async _onPointerEventStop(event: MouseTouchEvent) {
    const currentDegree = this._currentDegree();
    const snapDegrees = this.selected() === 'hours' ? snapAngle(currentDegree, 12) : snapAngle(currentDegree, 60);

    await this._rotateAnimation(this._currentDegree(), snapDegrees, this._motion / 2, 2);
    this._currentDegree.set(snapDegrees);
    this._loading.set(false);
  }

  private _fillDial(dial: HTMLElement, labels: number[], withClean: boolean, inset: number = 2) {
    if (withClean) {
      dial.innerHTML = '';
    }
    const clockIterable = new ClockIterable(labels, this._labelSize, this._radius * 2, inset);
    for (const [label, x, y] of clockIterable) {
      const numero = this._document.createElement('div');
      numero.classList.add('rk-clock-dial-label')
      numero.textContent =  this.selected() === 'hours' ? label.toString() : label.toString().padStart(2, '0');
      numero.style.position = 'absolute';
      numero.style.left = x + 'px';
      numero.style.top = y + 'px';
      this._renderer.appendChild(dial, numero);
    }
  }

  private _fillBySelected(selected: string, format: string) {
    switch (selected) {
      case 'hours':
        if (format === '12h') {
          this._fillDial(this._dial().nativeElement, HOURS_LABEL, true);
          this._fillDial(this._clipedLabel().nativeElement, HOURS_LABEL, true);
        } else if (format === '24h') {
          this._fillDial(this._dial().nativeElement, HOURS_LABEL_24_P1, true);
          this._fillDial(this._dial().nativeElement, HOURS_LABEL_24_P2, false, 38);
          this._fillDial(this._clipedLabel().nativeElement, HOURS_LABEL_24_P1, true);
          this._fillDial(this._clipedLabel().nativeElement, HOURS_LABEL_24_P2, false, 38);
        }
        break;
      case 'minutes':
        this._fillDial(this._dial().nativeElement, MINUTES_LABEL, true);
        this._fillDial(this._clipedLabel().nativeElement, MINUTES_LABEL, true);
        break;
      default:
        this._fillDial(this._dial().nativeElement, HOURS_LABEL, true);
        this._fillDial(this._clipedLabel().nativeElement, HOURS_LABEL, true);
    }
  }

  private _moveByTouchClick(event: MouseTouchEvent, dial: HTMLElement, inset: number = 2) {
    const rect = dial.getBoundingClientRect();
    // relative to the center of the clock
    const x = event.clientX - rect.left - this._radius;
    const y = event.clientY - rect.top - this._radius;

    // Calc angle in degrees
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) {
      angle += 360; //make sure the angle is in the range [0, 360]
    }
  
    // Calc new position for the object (using radius as reference)
    let radius = this._radius - (this._labelSize / 2) - inset;

//--------------------------------------------------------------------------------------------------------------//
    // logic when format is 24h and two dial exist
    const distanceFromCenter = Math.sqrt(x * x + y * y);
    const MAX_RAD = radius - 20;
    let selectorInset = 0;
    
    if (distanceFromCenter < MAX_RAD && this.selected() === 'hours' && this.format() === '24h') {
        radius -= 36;
        this._currentDial.set(2);
        selectorInset = 36;
    } else {
      this._currentDial.set(1);
      selectorInset = 0;
    }
  
//----------------------------------------------------------------------------------------------------------------//

    const moveX = this._radius + radius * Math.cos(angle * (Math.PI / 180));
    const moveY = this._radius + radius * Math.sin(angle * (Math.PI / 180));
    // Call the provided functions with the calculated values
    this._moveTrack(moveX, moveY);
    this._moveSelector(angle, selectorInset);
    this._currentDegree.set(angle);

    //update time
    const snapDegrees = this.selected() === 'hours' ? snapAngle(angle, 12) : snapAngle(angle, 60);
    const currentDate = this.currentTime();
    const date = currentDate ? new Date(currentDate) :  new Date();
    
    if(this.selected() === 'hours') {
      let hours = this.format() === '24h' ? angleToHours24(snapDegrees, this._currentDial()) : angleToHours(snapDegrees);
      if(this.format() === '24h') {
        this.period.set(hours < 12 ? 'AM' : 'PM');
      }
      if (this.format() !== '24h' && this.period() === 'PM') {
        hours = hours < 12 ? hours + 12 : hours; 
      }
      if(this.period() === 'AM' && hours >= 12 && this.format() === '12h') {
        hours = hours - 12;
      }
      date.setHours(hours);
    } else {
      date.setMinutes(angleToMinutes(snapDegrees));
    }
    
    this.currentTime.set(date);
  }

  private _moveByAngle(angle: number, inset: number = 2) {
      // Ensure angle is within 0-360 range
      angle = angle % 360;
      if (angle < 0) {
          angle += 360;
      }
      // Calc new position for the object (using radius as reference)
      let radius = this._radius - (this._labelSize / 2) - inset;

      // logic when format is 24h and two dial exist
      let selectorInset = 0;
      if (this.selected() === 'hours' && this.format() === '24h' && this._currentDial() === 2) {
        radius -= 36;
        selectorInset = 36;
      }

      const moveX = this._radius + radius * Math.cos(angle * (Math.PI / 180));
      const moveY = this._radius + radius * Math.sin(angle * (Math.PI / 180));

      // Call the provided functions with the calculated values
      this._moveTrack(moveX, moveY);
      this._moveSelector(angle, selectorInset);
  }

  private _moveTrack(x: number, y: number) {
    this._renderer.setStyle(this._clipedLabel().nativeElement, 'clip-path', `circle(24px at ${x}px ${y}px)`);
  }

  private _moveSelector(degrees: number, inset: number = 0) {
    this._renderer.setStyle(this._dialSelector().nativeElement, 'width', 104 - inset + 'px');
    this._renderer.setStyle(this._dialSelector().nativeElement, 'transform', `rotate(${degrees}deg)`);
  }

  private async _rotateAnimation(currentDegree: number, degree: number, animationTime: number, inset: number = 2): Promise<void> {
    return new Promise<void>((resolve) => {
        // Calculate the shortest angle difference between the current and target degrees.
        let angleDiff = degree - currentDegree;

        // Adjust the angle difference to be within the range of -180 to 180 degrees.
        if (angleDiff > 180) {
            angleDiff -= 360;
        } else if (angleDiff < -180) {
            angleDiff += 360;
        }

        // Store the start time of the animation.
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            // Initialize the start time if it hasn't been set yet.
            if (!startTime) startTime = timestamp;

            // Calculate the progress of the animation (0 to 1).
            let progress = Math.min((timestamp - startTime) / animationTime, 1);

            // Apply a cubic Bezier easing function to the progress.  This makes the animation smoother.
            const easedProgress = cubicBezier(0.05, 0.7, 0.1, 1.0, progress);

            // Calculate the current angle based on the eased progress.
            const currentAngle = currentDegree + angleDiff * easedProgress;

            // Update the position of the dial and selector based on the current angle.
            this._moveByAngle(currentAngle, inset);

            // Continue the animation if it's not finished.
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve(); // Resolve the promise when the animation is complete.
            }
        };
        requestAnimationFrame(animate);
    });
  }
}