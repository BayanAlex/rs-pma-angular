import { Component, Inject, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CheckItem, CheckList, EditTaskData } from 'src/app/interfaces/app.interfaces';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss']
})
export class EditTaskDialogComponent {
  @ViewChildren('checkItemTitle') checkItemsInputs: QueryList<ElementRef>;
  checkList: CheckList;
  private titleInputBlured = false;

  constructor(public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTaskData) {
      this.checkList = data.checkList.map((item) => {return {...item}});
  }

  focus(event: Event) {
    if (event.target && this.data.title && !this.titleInputBlured) {
      (event.target as HTMLInputElement).blur();
      this.titleInputBlured = true;
    }
  }

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

  addCheckItem(): void {
    const item: CheckItem = {
      title: '',
      boardId: '',
      taskId: '',
      done: false
    }
    this.checkList.push(item);
    setTimeout(() => this.checkItemsInputs.toArray()[this.checkList.length -1].nativeElement.focus(), 0);
  }

  deleteCheckItem(index: number) {
    this.checkList.splice(index, 1);
  }
}
