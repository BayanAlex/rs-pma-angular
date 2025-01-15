import { Component, input, output } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: false
})
export class BoardComponent {
  readonly title = input<string>();
  readonly id = input<string>();
  readonly index = input<number>();
  readonly deleteBoard = output<string>();
  readonly editBoard = output<string>();

  constructor(private appService: AppService) {}

  deleteClick(event: Event): void {
    this.appService.showConfirmDialog('BOARDS_PAGE.DELETE_DIALOG.TEXT', 'BOARDS_PAGE.DELETE_DIALOG.CAPTION')
      .subscribe((confirm) => {
        if (confirm) {
          this.deleteBoard.emit(this.id()!);
        }
      });
    event.stopPropagation();
  }

  editClick(event: Event): void {
    this.editBoard.emit(this.id()!);
    event.stopPropagation();
  }
}
