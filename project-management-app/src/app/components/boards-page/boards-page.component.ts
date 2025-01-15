import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Board } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { EditTitleDialogComponent } from '../edit-title-dialog/edit-title-dialog.component';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BoardsService } from 'src/app/services/boards.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-boards-page',
  templateUrl: './boards-page.component.html',
  styleUrls: ['./boards-page.component.scss'],
  standalone: false
})
export class BoardsPageComponent implements OnInit, OnDestroy {
  boards: Board[];
  createBoardSubscription: Subscription;

  constructor(
    private appService: AppService,
    private authService: AuthService,
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => this.boards = data['boards']);
    this.createBoardSubscription = this.appService.createBoard$.subscribe(() => this.createBoard());
  }

  ngOnDestroy(): void {
    this.createBoardSubscription.unsubscribe();
  }

  showEditDialog(dialogTitle: string, title: string): Observable<string> {
    const dialogRef = this.dialog.open(EditTitleDialogComponent, { data: { dialogTitle, title, placeholder: 'INPUTS.PLACEHOLDERS.BOARD_TITLE' } });
    return dialogRef.afterClosed();
  }

  createBoard(): void {
    this.showEditDialog('NEW_BOARD_DIALOG.TITLE', '').subscribe((result) => {
      if (result) {
        this.boardsService.createBoard(result, this.authService.user()!._id)
          .subscribe((board) => this.boards.push(board));
      }
    });
  }

  deleteBoard(id: string): void {
    this.boardsService.deleteBoard(id).subscribe(() => {
      const index = this.boards.findIndex((board) => board._id === id);
      this.boards.splice(index, 1);
    });
  }

  editBoard(id: string): void {
    const index = this.boards.findIndex((board) => board._id === id);
    const title = this.boards[index].title;
    this.showEditDialog('EDIT_BOARD_DIALOG.TITLE', title).subscribe((newTitle) => {
      if (newTitle) {
        this.boardsService.editBoard(id, newTitle, this.authService.user()!._id)
          .subscribe((board) => this.boards[index].title = board.title);
      }
    });
  }
}
