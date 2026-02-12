import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hospitality } from './hospitality';

describe('Hospitality', () => {
  let component: Hospitality;
  let fixture: ComponentFixture<Hospitality>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hospitality]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hospitality);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
