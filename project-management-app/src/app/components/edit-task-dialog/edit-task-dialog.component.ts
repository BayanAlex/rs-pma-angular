import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditTaskData } from 'src/app/interfaces/app.interfaces';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss']
})
export class EditTaskDialogComponent {
  constructor(public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTaskData) {}

  // @HostListener('window:keyup.Enter', ['$event'])
  // onDialogClick(event: KeyboardEvent): void {
  //   const result = {
  //     title: this.data.title,
  //     description: this.data.description
  //   };
  //   this.dialogRef.close(result);
  // }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
