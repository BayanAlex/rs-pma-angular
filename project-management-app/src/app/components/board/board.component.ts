import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  @Input() title: string;
  @Input() id: string;
  @Input() index: number;
  @Output() deleteBoard: EventEmitter<string> = new EventEmitter();
  @Output() editBoard: EventEmitter<string> = new EventEmitter();

  constructor(private app: AppService) {}

  deleteClick(event: Event): void {
    this.app.showConfirmDialog('BOARDS_PAGE.DELETE_DIALOG.TEXT', 'BOARDS_PAGE.DELETE_DIALOG.CAPTION').subscribe({
      next: (confirm) => {
        if (confirm) {
          this.deleteBoard.emit(this.id);
        }
      }
    });
    event.stopPropagation();
  }

  editClick(event: Event): void {
    this.editBoard.emit(this.id);
    event.stopPropagation();
  }
}
