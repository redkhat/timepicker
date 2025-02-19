# Redkhat Timepicker

This project contains a series of time selection components. The timepicker allows users to select a time from a clock-like interface. The timepicker is built using `Angular 19+` and `Angular Material 19+`.

> **_NOTE:_**  `RkTimepicker` and `RKClock` is not a substitute for the standard Angular Material timepicker.
For features like time ranges or specific hour selection, Angular's official methods are recommended.

## Demo
 [RkTimepicker](https://redkhat.github.io/timepicker/)

## Install components and dependencies

First install the Angular Material.

```bash
ng add @angular/material
```

Then install the timepicker components.

```bash
npm install @redkhat/timepicker
```

## Configuration

`RkTimepicker` and `RkClock` require Angular Material themes using their Material Design 3 variant. You must also import the SCSS file from the @redkhat/timepicker library.
```json
// your angular.json
"styles": [
    "@angular/material/prebuilt-themes/azure-blue.css", // angular material theme
    "src/styles.scss",
    "@redkhat/timepicker/_rk-timepicker-theme.scss"// timepicker theme
]
```

## Usage 

` @redkhat/timepicker` provides two principal components: `RkTimepicker` and `RkClock`.
RkTimepicker is used together with an input field to display a dialog with the clock interface. RkClock is a standalone(inlined) clock interface.

### Connecting a timepicker to an input

1. Import `RkTimepicker`, `RkTimepickerInput`, `RkTimepickerToggle` in your component.
2. Add `<rk-timepicker>` and `<rk-timepicker-toggle>` to your template.
3. Export a reference of `<rk-timepicker>`, in this case, we use `#picker`.
4. Add the `[rkTimepicker]` directive to the input field and bind it to the timepicker reference.
5. Add the `matSuffix` directive to the `<rk-timepicker-toggle>` component and bind it to the timepicker reference using the `[for]` input.

```html
<mat-form-field>
    <mat-label>Time</mat-label>
    <input matInput [rkTimepicker]="picker" placeholder="Ex. 3:00 PM" />
    <rk-timepicker-toggle matSuffix [for]="picker"></rk-timepicker-toggle>
    <rk-timepicker #picker></rk-timepicker>
</mat-form-field>
```

### Using timecker without `RkTimepickerToggle` component

`RkTimepicker` component exposes a public method `open()` to open the timepicker dialog. You can use this method to open the timepicker dialog from a custom button or any other component.

```html
<mat-form-field>
    <mat-label>Time</mat-label>
    <input matInput [rkTimepicker]="picker" placeholder="Ex. 3:00 PM" />
    <button mat-icon-button (click)="picker.open()">
        <mat-icon>schedule</mat-icon>
    </button>
    <rk-timepicker #picker></rk-timepicker>
</mat-form-field>
```

### Using timepicker inline with `RkClock` component

If you want to use the clock interface inline in your template you can use the `RkClock` component. This component have an input model named `time` to bind the selected time (unlike `RkTimepicker` where `time` is a optional input used to set the initial time).

```html
<rk-clock [(time)]="time">
</rk-clock>
```

### Using timepicker with Template-driven and Reactive Forms

`RkTimepicker` can be used with Angular forms thanks to the directive `RkTimepickerInput` that implements the `ControlValueAccessor` interface, this allows the timepicker to work with both template-driven and reactive forms and also comes with a custom validator to validate the time input.
```html
<mat-form-field class="example-full-width">
    <mat-label>Time</mat-label>
    <input matInput [rkTimepicker]="picker"  [formControl]="time" placeholder="Ex. 3:00 PM" />
    <rk-timepicker-toggle matSuffix [for]="picker"></rk-timepicker-toggle>
    <rk-timepicker #picker></rk-timepicker>
    @if (time.hasError('invalidTimeFormat') && !time.hasError('required')) {
        <mat-error>You must enter a valid time.</mat-error>
    }
    @if (time.hasError('required')) {
        <mat-error>You must enter a value.</mat-error>
    }
</mat-form-field>
<!-- This section below is merely demonstrative -->
<section class="data-container">
    <p> Value: {{ time.value }} </p>
    <p> Valid: {{ time.valid }} </p>
    <p> Dirty: {{ time.dirty }} </p>
    <p> Touched: {{ time.touched }} </p>
    <p> Invalid: {{ time.invalid }} </p>
    <p> Errors: {{ time.errors | json }} </p>
</section>
```

### Integration with Datepicker

`RkTimepicker` and `RkClock` can be used together with `MatDatepicker` to create a complete date and time selection interface. This is possible because these timepickers only modify the time part of the date object therefore you can use the same date object in the datepicker and timepicker.

```html
<mat-form-field>
    <mat-label>Date</mat-label>
    <input matInput [matDatepicker]="datepicker" [(ngModel)]="value">
    <mat-datepicker-toggle [for]="datepicker" matSuffix/>
    <mat-datepicker #datepicker/>
</mat-form-field>

<mat-form-field>
    <mat-label>Time</mat-label>
    <input matInput [rkTimepicker]="picker" [(ngModel)]="value"/>
    <rk-timepicker-toggle matSuffix [for]="picker"></rk-timepicker-toggle>
    <rk-timepicker #picker></rk-timepicker>
</mat-form-field>
```

## RkTimepickerInput Directive

Used to connect an input field to a `RkTimepicker` component.

Selector: `input[rkTimepicker]`

Exported as: `rkTimepickerInput`

### Properties

| Name  | Description  |
| ------------ | ------------ |
| disabled: `InputSignal<boolean>`  | Whether the input is disabled.  Default is `false`.  |
| rkTimepicker: `InputSignal<RkTimepicker>` | The timepicker that this input is associated with. `Required`  |
| value: `ModelSignal<Date \| null>` | The value of the input. No modifying this property directly. Use `ngModel` or `formControl` instead. |

### Methods

| Name  | Description  |
| ------------ | ------------ |
| focus()  | Focuses the input.  |

## RkTimepicker Component

A component that opens a dialog with a clock interface to select a time.

Selector: `rk-timepicker`

Exported as: `rkTimepicker`

### Properties

| Name  | Description  |
| ------------ | ------------ |
| time: `InputSignal<Date \| null>`  | Default time to open the timepicker with.  Default is `null \| new Date()`.  |
| orientation: `ModelSignal<string>` | The orientation of the timepicker. Values `landscape` and `portrait` Default is `portrait`.  |
| editable: `ModelSignal<boolean>` | Editable mode of the timepicker (hide the clock interface). Default is `false`.  |
| format: `ModelSignal<string>` | The format of the timepicker. Values `12h` and `24h`. Default is `12h`.  |
| period: `ModelSignal<string>` | The period (disabled if format is 24h).  Values `AM` and `PM` Default is `AM`.  |
| selected: `ModelSignal<string>` | Part of the time that is selected. Values `hours` and `minutes`. Default is `hour`.  |
| headline: `InputSignal<string>` | The headline of the timepicker.  Ex `Select a time`  |
| inputLabels: `InputSignal<string[]>` | The labels of the input fields. Ex `['Hours', 'Minutes']`  |
| actions: `InputSignal<string[]>` | The labels of the action buttons. Ex `['Cancel', 'Ok']`  |
| opened: `OutputSignal<void>` | Event emitted when the timepicker is opened.  |
| closed: `OutputSignal<void>` | Event emitted when the timepicker is closed.  |
| selectedTime: `OutputSignal<Date>` | Event emitted when the time is selected (when the Ok button is clicked).  |

### Methods

| Name  | Description  |
| ------------ | ------------ |
| open()  | Opens the timepicker dialog.  |

## RkTimepickerToggle Component

A component that opens a dialog with a clock interface to select a time.

Selector: `rk-timepicker-toggle`

### Properties

| Name  | Description  |
| ------------ | ------------ |
| for: `InputSignal<RkTimepicker>`  | The timepicker that this toggle is associated with.  |
| disabled: `InputSignal<boolean>` | Whether the toggle is disabled. Default is `false`.  |

## RkClock Component

A standalone clock interface to use inline in your template. Unlike `RkTimepicker`, `RkClock` no has actions buttons to confirm or cancel the time selected, therefore `RkClock` will update the time automatically while the user interacts with the clock.

Selector: `rk-clock`

Exported as: `rkClock`

### Properties

| Name  | Description  |
| ------------ | ------------ |
| time: `ModelSignal<Date \| null>`  | The selected time.  Default is `null \ new Date()`.  |
| selected: `ModelSignal<string>` | Part of the time that is selected. Values `hours` and `minutes`. Default is `hour`.  |
| format: `ModelSignal<string>` | The format of the timepicker. Values `12h` and `24h`. Default is `12h`.  |
| period: `ModelSignal<string>` | The period (disabled if format is 24h).  Values `AM` and `PM` Default is `AM`.  |
| editable: `ModelSignal<boolean>` | Editable mode of the timepicker (hide the clock interface). Default is `false`.  |
| orientation: `ModelSignal<string>` | The orientation of the timepicker. Values `landscape` and `portrait` Default is `portrait`.  |
| headline: `InputSignal<string>` | The headline of the timepicker.  Ex `Select a time`  |

> Friendly reminder, ModelSignal automatically creates outputs for the properties. Example: `time` input has `timeChange` output.

## License
MIT, see [LICENSE.md](/LICENSE.md) for details.
