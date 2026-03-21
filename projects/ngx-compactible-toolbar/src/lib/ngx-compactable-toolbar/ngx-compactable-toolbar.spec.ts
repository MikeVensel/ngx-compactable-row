import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxCompactableToolbar } from './ngx-compactable-toolbar';

describe('NgxCompactableToolbar', () => {
  let component: NgxCompactableToolbar;
  let fixture: ComponentFixture<NgxCompactableToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxCompactableToolbar],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxCompactableToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
