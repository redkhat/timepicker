import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RkTimepicker } from './timepicker';

describe('RkTimepicker', () => {
  let component: RkTimepicker;
  let fixture: ComponentFixture<RkTimepicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RkTimepicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RkTimepicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
