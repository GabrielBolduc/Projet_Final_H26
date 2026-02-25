import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsForm } from './units-form';

describe('UnitsForm', () => {
  let component: UnitsForm;
  let fixture: ComponentFixture<UnitsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
