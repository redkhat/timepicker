import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RkTimepickerDial } from './timepicker-dial';
import { ComponentRef } from '@angular/core';

describe('RkTimepickerDial', () => {
  let component: RkTimepickerDial;
  let componentRef: ComponentRef<RkTimepickerDial>
  let fixture: ComponentFixture<RkTimepickerDial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RkTimepickerDial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RkTimepickerDial);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('time', new Date());

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
