import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBadge } from './list-badge';

describe('ListBadge', () => {
  let component: ListBadge;
  let fixture: ComponentFixture<ListBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
