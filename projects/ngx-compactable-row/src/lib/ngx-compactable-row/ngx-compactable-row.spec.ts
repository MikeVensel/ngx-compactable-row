import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxCompactableRow } from './ngx-compactable-row';

describe('NgxCompactableRow', () => {
  let component: NgxCompactableRow;
  let fixture: ComponentFixture<NgxCompactableRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxCompactableRow],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxCompactableRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
