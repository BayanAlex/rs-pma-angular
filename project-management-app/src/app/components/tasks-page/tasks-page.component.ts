import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { mergeMap, Observable, Subscription, forkJoin } from 'rxjs';
import { CheckList, Column, EditTaskResult, Task, TasksColumn } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { HttpService } from 'src/app/services/http/http.service';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { EditTitleDialogComponent } from '../edit-title-dialog/edit-title-dialog.component';

@Component({
  selector: 'app-tasks-page',
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.scss'],
  standalone: false
})
export class TasksPageComponent implements OnInit {
  columns: TasksColumn[] = [];
  boardId: string;
  boardTitle: string;
  createColumnSubscription: Subscription;
  showTaskSubscription: Subscription;

  constructor(private app: AppService, private http: HttpService, private route: ActivatedRoute, private dialog: MatDialog) {
    this.showTaskSubscription = this.app.showTask$.subscribe({
      next: (taskData) => {
        const boardId = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
        if (boardId !== this.boardId) {
          this.boardId = boardId;
          this.boardTitle = this.route.snapshot.data['tasksPageData']['boardTitle'];
          this.assignColumns(this.route.snapshot.data['tasksPageData']['tasksColumns']);
        }
        const columnIndex = this.columns.findIndex((column: Column) => column._id === taskData.columnId);
        if (columnIndex >= 0) {
          const taskIndex = this.columns[columnIndex].tasks.findIndex((task: Task) => task._id === taskData.taskId);
          if (taskIndex >= 0) {
            this.editTask(columnIndex, taskIndex);
          }
        }
      }
    });

    this.createColumnSubscription = this.app.createColumn$.subscribe({
      next: () => {
        this.createColumn();
      }
    });
  }

  ngOnInit(): void {
    this.boardId = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
    this.boardTitle = this.route.snapshot.data['tasksPageData']['boardTitle'];
    this.assignColumns(this.route.snapshot.data['tasksPageData']['tasksColumns']);
  }

  ngOnDestroy(): void {
    this.createColumnSubscription.unsubscribe();
    this.showTaskSubscription.unsubscribe();
  }

  setEditMode(index: number, edit: boolean): void {
    this.columns[index].editMode = edit;
  }

  createTask(columnIndex: number): void {
    this.showTaskEditDialog('NEW_TASK_DIALOG.TITLE', this.boardTitle, this.columns[columnIndex].title).subscribe({
      next: (taskData: EditTaskResult) => {
        if (taskData) {
          const order = this.columns[columnIndex].tasks.length > 0 ? Math.max(...this.columns[columnIndex].tasks.map((task) => task.order)) + 1 : 0;
          const columnId = this.columns[columnIndex]._id;
          this.http
            .createTask(taskData.title, taskData.description, this.boardId, columnId, order, this.app.user._id)
            .pipe(
              mergeMap((task: Task) => {
                this.columns[columnIndex].tasks.push(task);
                taskData.checkList.forEach((item) => {
                  item.boardId = this.boardId;
                  item.taskId = task._id;
                });
                return this.http.createCheckList(taskData.checkList);
              })
            )
            .subscribe();
        }
      }
    });
  }

  editTask(columnIndex: number, taskIndex: number): void {
    const title = this.columns[columnIndex].tasks[taskIndex].title;
    const description = this.columns[columnIndex].tasks[taskIndex].description;
    let checkList: CheckList = [];

    this.http.getCheckList(this.columns[columnIndex].tasks[taskIndex]._id).pipe(
      mergeMap((list: CheckList) => {
        checkList = list;
        return this.showTaskEditDialog('EDIT_TASK_DIALOG.TITLE', this.boardTitle ,this.columns[columnIndex].title, title, description, list);
      })
    )
    .subscribe({
      next: (taskData: EditTaskResult) => {
        if (!taskData) {
          return;
        }

        const newCheckList = taskData.checkList;
        const column = this.columns[columnIndex];
        this.http.editTask(
            taskData.title,
            taskData.description,
            this.boardId,
            column._id,
            column.tasks[taskIndex]._id,
            column.order,
            this.app.user._id
          )
          .pipe(
            mergeMap((task: Task) => {
              const requestsList: Observable<any>[] = [];
              this.columns[columnIndex].tasks[taskIndex] = task;
              // to edit
              newCheckList.filter((newItem) => checkList.findIndex((item) => newItem._id === item._id && (newItem.title !== item.title || newItem.done !== item.done)) >= 0)
              .forEach((item) => {
                if (item._id) {
                  requestsList.push(this.http.editCheckItem(item._id, item.title, item.done));
                }
              });
              // to delete
              checkList.filter((item) => newCheckList.findIndex((newItem) => newItem._id === item._id) === -1)
              .forEach((item) => {
                if (item._id) {
                  requestsList.push(this.http.deleteCheckItem(item._id));
                }
              });
              // to create
              const newItems: CheckList = newCheckList.filter((newItem) => checkList.findIndex((item) => newItem._id === item._id) === -1);
              newItems.forEach((item) => { item.boardId = this.boardId; item.taskId = task._id });
              if (newItems.length > 0) {
                requestsList.push(this.http.createCheckList(newItems));
              }
              return forkJoin(requestsList);
            })
          ).subscribe();
      }
    });
  }

  assignColumns(tasksColumns: TasksColumn[]): void {
    this.columns = [];
    tasksColumns.slice().sort((col1, col2) => col1.order - col2.order).forEach((column) => {
      column.tasks.sort((task1, task2) => task1.order - task2.order);
      this.columns.push(column);
    });
  }

  createColumn(): void {
    this.showColumnEditDialog('NEW_COLUMN_DIALOG.TITLE').subscribe({
      next: (title) => {
        if (title) {
          const order = this.columns.length > 0 ? Math.max(...this.columns.map((column) => column.order)) + 1 : 0;
          this.http.createColumn(title, order, this.boardId).subscribe({
            next: (column) => {
              this.columns.push({...column, editMode: false, tasks: []});
            }
          });
        }
      }
    });
  }

  editColumnTitle(title: string, index: number): void {
    this.http.editColumn(title, this.columns[index].order, this.columns[index].boardId, this.columns[index]._id).subscribe({
      next: (column) => {
        this.columns[index].title = column.title;
      }
    });
  }

  showColumnEditDialog(dialogTitle: string, title: string = ''): Observable<string> {
    const dialogRef = this.dialog.open(EditTitleDialogComponent, { data: { dialogTitle, title, placeholder: 'INPUTS.PLACEHOLDERS.COLUMN_TITLE' } });
    return dialogRef.afterClosed();
  }

  showTaskEditDialog(
    dialogTitle: string,
    boardTitle: string,
    columnTitle: string,
    title: string = '',
    description: string = '',
    checkList: CheckList = []
  ): Observable<EditTaskResult> {
    const data = {
      data: {
        dialogTitle,
        boardTitle,
        columnTitle,
        title,
        titlePlaceholder: 'INPUTS.PLACEHOLDERS.TASK_TITLE',
        description,
        descriptionPlaceholder: 'INPUTS.PLACEHOLDERS.TASK_DESCRIPTION',
        checkList,
      },
      disableClose: true
    };
    const dialogRef = this.dialog.open(EditTaskDialogComponent, data);
    return dialogRef.afterClosed();
  }

  deleteColumnClick(event: Event, columnIndex: number): void {
    this.app.showConfirmDialog('TASKS_PAGE.COLUMN.DELETE_DIALOG.TEXT', 'TASKS_PAGE.COLUMN.DELETE_DIALOG.CAPTION')
    .pipe(
      mergeMap((confirm) => {
        if (confirm) {
          return this.http.deleteColumn(this.boardId, this.columns[columnIndex]._id);
        }
        return new Observable<void>;
      })
    ).subscribe({
      next: () => {
        this.columns.splice(columnIndex, 1);
      }
    });
    event.stopPropagation();
  }

  deleteTaskClick(event: Event, columnIndex: number, taskIndex: number): void {
    const columnId: string = this.columns[columnIndex]._id;
    const taskId: string = this.columns[columnIndex].tasks[taskIndex]._id;
    this.app.showConfirmDialog('TASKS_PAGE.TASK.DELETE_DIALOG.TEXT', 'TASKS_PAGE.TASK.DELETE_DIALOG.CAPTION')
    .pipe(
      mergeMap((confirm) => {
        if (confirm) {
          return this.http.deleteTask(this.boardId, columnId, taskId);
        }
        return new Observable<void>;
      })
    ).subscribe({
      next: () => {
        this.columns[columnIndex].tasks.splice(taskIndex, 1);
      }
    });
    event.stopPropagation();
  }

  dropColumn(event: CdkDragDrop<Column[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.columns.forEach((column, index) => column.order = index);
    this.http.updateColumnsOrder(this.columns).subscribe();
  }

  dropTask(event: CdkDragDrop<TasksColumn>): void {
    let updateTasksList: Task[];
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) {
        return;
      }
      moveItemInArray(event.container.data.tasks, event.previousIndex, event.currentIndex);
      event.container.data.tasks.forEach((task, index) => task.order = index);
      updateTasksList = event.container.data.tasks;
    } else {
      transferArrayItem(
        event.previousContainer.data.tasks,
        event.container.data.tasks,
        event.previousIndex,
        event.currentIndex,
      );
      const previousColumn = event.previousContainer.data;
      const currentColumn = event.container.data;
      currentColumn.tasks[event.currentIndex].columnId = currentColumn._id;
      previousColumn.tasks.forEach((task, index) => task.order = index);
      currentColumn.tasks.forEach((task, index) => task.order = index);
      updateTasksList = [...previousColumn.tasks, ...currentColumn.tasks];
    }
    this.http.updateTasksOrder(updateTasksList).subscribe();
  }

  columnTitleOnEnterKey(title: string, columnIndex: number): void {
    if (title.length === 0) {
      return;
    }
    this.setEditMode(columnIndex, false);
    this.editColumnTitle(title, columnIndex);
  }

  isTouchScreen(): boolean {
    return navigator.maxTouchPoints > 0;
  }
}
