import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RkClock } from './clock';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RkClock', () => {
  let component: RkClock;
  let fixture: ComponentFixture<RkClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RkClock, MatButtonModule, MatIconModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RkClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize value with the current date if null', () => {
    expect(component.value()).toBeInstanceOf(Date);
  });

  it('should set load to true after rendering', () => {
    expect(component.load()).toBeTrue();
  });

  it('should toggle editable when calling changeMode', () => {
    component.editable.set(false);
    component.changeMode();
    expect(component.editable()).toBeTrue();

    component.changeMode();
    expect(component.editable()).toBeFalse();
  });

  it('should add landscape class if orientation is landscape', () => {
    component.orientation.set('landscape');
    fixture.detectChanges();
    const host = fixture.nativeElement;
    expect(host.classList.contains('rk-timepicker-landscape')).toBeTrue();
  });

  it('should add editable class when editable is true', () => {
    component.editable.set(true);
    fixture.detectChanges();
    const host = fixture.nativeElement;
    expect(host.classList.contains('rk-timepicker-editable')).toBeTrue();
  });

  it('should have inputSupportLabels by default', () => {
    expect(component.inputSupportLabels()).toEqual(['Hour', 'Minute']);
  });

  it('should hide the container if load is false', () => {
    component.load.set(false);
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('.rk-timepicker-container');
    expect(container.classList.contains('rk-timepicker-container-hide')).toBeTrue();
  });

  it('should call changeMode when clicking the button', () => {
    spyOn(component, 'changeMode');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.changeMode).toHaveBeenCalled();
  });
});
