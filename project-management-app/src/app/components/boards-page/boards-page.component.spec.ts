import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardsPageComponent } from './boards-page.component';

describe('BoardsPageComponent', () => {
  let component: BoardsPageComponent;
  let fixture: ComponentFixture<BoardsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
