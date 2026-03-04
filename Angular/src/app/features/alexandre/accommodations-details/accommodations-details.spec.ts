import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationsDetails } from './accommodations-details';

describe('AccommodationsDetails', () => {
  let component: AccommodationsDetails;
  let fixture: ComponentFixture<AccommodationsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccommodationsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccommodationsDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
