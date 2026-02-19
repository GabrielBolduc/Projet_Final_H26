import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationsForm } from './reservations-form';

describe('ReservationsForm', () => {
  let component: ReservationsForm;
  let fixture: ComponentFixture<ReservationsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
