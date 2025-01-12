import { Component, Inject, ElementRef, HostListener, viewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CheckItem, CheckList, EditTaskData } from 'src/app/interfaces/app.interfaces';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss'],
  standalone: false
})
export class EditTaskDialogComponent {
  readonly checkItemsInputs = viewChildren<ElementRef>('checkItemTitle');
  checkList: CheckList;
  private titleInputBlured = false;

  constructor(public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTaskData) {
    this.checkList = data.checkList.map((item) => ({...item}));
  }

  focus(event: Event): void {
    if (event.target && this.data.title && !this.titleInputBlured) {
      (event.target as HTMLInputElement).blur();
      this.titleInputBlured = true;
    }
  }

  @HostListener('window:keyup.Escape', ['$event'])
  onCancelClick(): void {
    this.dialogRef.close();
  }

  addCheckItem(): void {
    const item: CheckItem = {
      title: '',
      boardId: '',
      taskId: '',
      done: false
    }
    this.checkList.push(item);
    setTimeout(() => this.checkItemsInputs()[this.checkList.length -1].nativeElement.focus(), 0);
  }

  deleteCheckItem(index: number): void {
    this.checkList.splice(index, 1);
  }
}
