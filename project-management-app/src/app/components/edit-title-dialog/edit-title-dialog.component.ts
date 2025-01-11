import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditTitleData } from 'src/app/interfaces/app.interfaces';

@Component({
  selector: 'app-edit-title-dialog',
  templateUrl: './edit-title-dialog.component.html',
  styleUrls: ['./edit-title-dialog.component.scss'],
  standalone: false
})
export class EditTitleDialogComponent {
  constructor(public dialogRef: MatDialogRef<EditTitleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTitleData) {}

  @HostListener('window:keyup.Enter', ['$event'])
  onDialogClick(event: KeyboardEvent): void {
    this.dialogRef.close(this.data.title);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
