import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationsAdmin } from './reservations-admin';

describe('ReservationsAdmin', () => {
  let component: ReservationsAdmin;
  let fixture: ComponentFixture<ReservationsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationsAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
