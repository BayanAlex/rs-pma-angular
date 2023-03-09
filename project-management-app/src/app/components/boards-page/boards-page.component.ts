import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Board } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { HttpService } from 'src/app/services/http/http.service';
import { EditBoardDialogComponent } from '../edit-board-dialog/edit-board-dialog.component';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-boards-page',
  templateUrl: './boards-page.component.html',
  styleUrls: ['./boards-page.component.scss']
})
export class BoardsPageComponent implements OnInit, OnDestroy {
  boards: Board[];
  createBoardSubscription: Subscription;

  constructor(private app: AppService, private http: HttpService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.http.getBoards().subscribe({
      next: (boards) => {
        this.boards = boards;
      },
      error: (error) => {
        this.app.processError(error);
      }
    });

    this.createBoardSubscription = this.app.createBoard$.subscribe({
      next: (title) => {
        this.createBoard(title);
      }
    });
  }

  ngOnDestroy(): void {
    this.createBoardSubscription.unsubscribe();
  }

  showEditDialog(dialogTitle: string, boardTitle: string): Observable<string> {
    const dialogRef = this.dialog.open(EditBoardDialogComponent, { data: { dialogTitle, boardTitle } });
    return dialogRef.afterClosed();
  }

  createBoard(title: string): void {
    this.showEditDialog('NEW_BOARD_DIALOG.TITLE', title).subscribe({
      next: (result) => {
        if (result) {
          this.http.createBoard(result, this.app.user.login).subscribe({
            next: (board) => {
              this.boards.push(board);
            },
            error: (error) => {
              this.app.processError(error);
            }
          });
        }
      }
    });
  }

  deleteBoard(id: string): void {
    this.http.deleteBoard(id).subscribe({
      next: () => {
        const index = this.boards.findIndex((board) => board._id === id);
        this.boards.splice(index, 1);
      },
      error: (error) => {
        this.app.processError(error);
      }
    })
  }

  editBoard(id: string): void {
    const index = this.boards.findIndex((board) => board._id === id);
    const title = this.boards[index].title;
    this.showEditDialog('EDIT_BOARD_DIALOG.TITLE', title).subscribe({
      next: (newTitle) => {
        if (newTitle) {
          this.http.editBoard(id, newTitle, this.app.user.login).subscribe({
            next: (board) => {
              this.boards[index].title = board.title;
            },
            error: (error) => {
              this.app.processError(error);
            }
          });
        }
      }
    });
  }
}
