import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditBoardData } from 'src/app/interfaces/app.interfaces';

@Component({
  selector: 'app-edit-board-dialog',
  templateUrl: './edit-board-dialog.component.html',
  styleUrls: ['./edit-board-dialog.component.scss']
})
export class EditBoardDialogComponent {
  constructor(public dialogRef: MatDialogRef<EditBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditBoardData) {}

  @HostListener('window:keyup.Enter', ['$event'])
  onDialogClick(event: KeyboardEvent): void {
    this.dialogRef.close(this.data.boardTitle);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
