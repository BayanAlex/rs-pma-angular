import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Board } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { HttpService } from 'src/app/services/http/http.service';
import { EditTitleDialogComponent } from '../edit-title-dialog/edit-title-dialog.component';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-boards-page',
  templateUrl: './boards-page.component.html',
  styleUrls: ['./boards-page.component.scss']
})
export class BoardsPageComponent implements OnInit, OnDestroy {
  boards: Board[];
  createBoardSubscription: Subscription;

  constructor(private app: AppService, private http: HttpService, private route: ActivatedRoute, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.route.data.subscribe({
      next: (data) => {
        this.boards = data['boards'];
      },
      error: (error) => {
        this.app.processError(error);
      }
    });

    this.createBoardSubscription = this.app.createBoard$.subscribe({
      next: () => {
        this.createBoard();
      }
    });
  }

  ngOnDestroy(): void {
    this.createBoardSubscription.unsubscribe();
  }

  showEditDialog(dialogTitle: string, title: string): Observable<string> {
    const dialogRef = this.dialog.open(EditTitleDialogComponent, { data: { dialogTitle, title, placeholder: 'INPUTS.PLACEHOLDERS.BOARD_TITLE' } });
    return dialogRef.afterClosed();
  }

  createBoard(): void {
    this.showEditDialog('NEW_BOARD_DIALOG.TITLE', '').subscribe({
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
