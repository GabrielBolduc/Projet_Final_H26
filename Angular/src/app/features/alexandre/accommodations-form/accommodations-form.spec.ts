import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationsForm } from './accommodations-form';

describe('AccommodationsForm', () => {
  let component: AccommodationsForm;
  let fixture: ComponentFixture<AccommodationsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccommodationsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccommodationsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
