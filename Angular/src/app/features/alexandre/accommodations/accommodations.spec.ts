import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accommodations } from './accommodations';

describe('Accommodations', () => {
  let component: Accommodations;
  let fixture: ComponentFixture<Accommodations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accommodations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Accommodations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
