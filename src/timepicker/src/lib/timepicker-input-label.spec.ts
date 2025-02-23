import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RkTimepickerInputLabel } from './timepicker-input-label';
import { ComponentRef } from '@angular/core';

describe('RkTimepickerInputLabel', () => {
  let component: RkTimepickerInputLabel;
  let componentRef: ComponentRef<RkTimepickerInputLabel>
  let fixture: ComponentFixture<RkTimepickerInputLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RkTimepickerInputLabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RkTimepickerInputLabel);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('time', new Date());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
