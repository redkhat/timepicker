import {  Component, effect, inject, model, Renderer2, signal } from '@angular/core'
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RkClock, RkTimepicker, RkTimepickerInput, RkTimepickerToggle } from '@redkhat/timepicker';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DOCUMENT, JsonPipe, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'rk-root',
  imports: [MatButtonModule, MatInputModule, NgClass, RkTimepickerToggle, MatToolbarModule, MatIconModule, ReactiveFormsModule, RkClock, JsonPipe, FormsModule, RkTimepickerInput, MatFormFieldModule, MatRadioModule, RkTimepicker, MatCardModule],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  title = 'Timepicker Demo';
  readonly time = new FormControl<Date | null>({value: new Date(2025, 1, 1, 13, 0, 0), disabled: false}, []);
  selected = signal('hours');
  format = signal('12h');
  period = signal('AM');
  theme = signal('light-mode');
  orientation = signal('portrait');
  headline = signal(['Enter time', 'Select time']);
  editable = signal(false);
  timepickerValue = model<Date | null>(null);

  private _renderer: Renderer2 = inject(Renderer2);
  private _document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const theme = this.theme();
      this._renderer.removeClass(this._document.body, theme === 'light-mode' ? 'dark-mode' : 'light-mode');
      this._renderer.addClass(this._document.body, theme);
    })
  }

  setTime1() {
    const date = new Date(2025, 1, 1, 13, 0, 0);
    this.time.setValue(date);
    return date;
  }

  setTime2() {
    const today = new Date();
    this.time.setValue(today);
    return today;
  }

  onOpen(event: any) {
    console.log('Opened');
  }

  onClose(event: any) {
    console.log('closed');
  }
}