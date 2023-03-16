import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTitleDialogComponent } from './edit-title-dialog.component';

describe('EditTitleDialogComponent', () => {
  let component: EditTitleDialogComponent;
  let fixture: ComponentFixture<EditTitleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTitleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTitleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
