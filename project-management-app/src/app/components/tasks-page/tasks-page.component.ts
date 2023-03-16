import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { mergeMap, Observable, Subscription } from 'rxjs';
import { Column, EditTaskResult, Task, TasksColumn } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { HttpService } from 'src/app/services/http/http.service';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { EditTitleDialogComponent } from '../edit-title-dialog/edit-title-dialog.component';


@Component({
  selector: 'app-tasks-page',
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.scss']
})
export class TasksPageComponent implements OnInit {
  columns: TasksColumn[] = [];
  boardId: string;
  boardTitle: string;
  createColumnSubscription: Subscription;

  constructor(private app: AppService, private http: HttpService, private route: ActivatedRoute, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.boardId = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
    this.boardTitle = this.route.snapshot.data['tasksPageData']['boardTitle'];
    this.assignColumns(this.route.snapshot.data['tasksPageData']['tasksColumns']);
    this.createColumnSubscription = this.app.createColumn$.subscribe({
      next: () => {
        this.createColumn();
      }
    });

    this.route.params.subscribe({
      next: (params) => {
        const columnIndex = this.columns.findIndex((column: Column) => column._id === params['columnId']);
        if (columnIndex >= 0) {
          const taskIndex = this.columns[columnIndex].tasks.findIndex((task: Task) => task._id === params['taskId']);
          if (taskIndex >= 0) {
            this.editTask(columnIndex, taskIndex);
          }
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.createColumnSubscription.unsubscribe();
  }

  setEditMode(index: number, edit: boolean) {
    this.columns[index].editMode = edit;
  }

  createTask(columnIndex: number) {
    this.showTaskEditDialog('NEW_TASK_DIALOG.TITLE').subscribe({
      next: (taskData: EditTaskResult) => {
        if (taskData) {
          const order = this.columns[columnIndex].tasks.length > 0 ? Math.max(...this.columns[columnIndex].tasks.map((task) => task.order)) + 1 : 0;
          if (taskData.description.length === 0) {
            taskData.description = ' '; // Backend reply hangs when passing empty description
          }
          this.http.createTask(taskData.title, taskData.description, this.boardId, this.columns[columnIndex]._id, order, this.app.user._id).subscribe({
            next: (task: Task) => {
              this.columns[columnIndex].tasks.push(task);
            },
            error: (error) => {
              this.app.processError(error);
            }
          });
        }
      }
    });
  }

  editTask(columnIndex: number, taskIndex: number) {
    const title = this.columns[columnIndex].tasks[taskIndex].title;
    const description = this.columns[columnIndex].tasks[taskIndex].description;
    this.showTaskEditDialog('EDIT_TASK_DIALOG.TITLE', title, description).subscribe({
      next: (taskData: EditTaskResult) => {
        if (taskData) {
          if (taskData.description.length === 0) {
            taskData.description = ' '; // Backend reply hangs when passing empty description
          }
          const column = this.columns[columnIndex];
          this.http.editTask(
            taskData.title,
            taskData.description,
            this.boardId,
            column._id,
            column.tasks[taskIndex]._id,
            column.order, this.app.user._id).subscribe({
            next: (task: Task) => {
              this.columns[columnIndex].tasks[taskIndex] = task;
            },
            error: (error) => {
              this.app.processError(error);
            }
          });
        }
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
            },
            error: (error) => {
              this.app.processError(error);
            }
          });
        }
      }
    });
  }

  editColumnTitle(title: string, index: number): void {
    this.http.editColumn(title, this.columns[index].order, this.columns[index].boardId, this.columns[index]._id).subscribe({
      next: (column) => {
        // this.columns.push({...column, editMode: false, tasks: []});
      },
      error: (error) => {
        this.app.processError(error);
      }
    });
  }

  showColumnEditDialog(dialogTitle: string, title: string = ''): Observable<string> {
    const dialogRef = this.dialog.open(EditTitleDialogComponent, { data: { dialogTitle, title, placeholder: 'INPUTS.PLACEHOLDERS.COLUMN_TITLE' } });
    return dialogRef.afterClosed();
  }

  showTaskEditDialog(dialogTitle: string, title: string = '', description: string = ''): Observable<EditTaskResult> {
    const data = {
      data: {
        dialogTitle,
        title,
        titlePlaceholder: 'INPUTS.PLACEHOLDERS.TASK_TITLE',
        description,
        descriptionPlaceholder: 'INPUTS.PLACEHOLDERS.TASK_DESCRIPTION',
      }
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
      },
      error: (error) => {
        this.app.processError(error);
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
      },
      error: (error) => {
        this.app.processError(error);
      }
    });
    event.stopPropagation();
  }

  dropColumn(event: CdkDragDrop<Column[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.columns.forEach((column, index) => column.order = index);
    this.http.updateColumnsOrder(this.columns).subscribe({
      // next: (newColumns) => this.assignColumns(newColumns),
      error: (error) => {
        this.app.processError(error);
      }
    });
  }

  dropTask(event: CdkDragDrop<TasksColumn>) {
    let updateTasksList: Task[];
    if (event.previousContainer === event.container) {
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
    this.http.updateTasksOrder(updateTasksList).subscribe({
      // next: (newColumns) => this.assignColumns(newColumns),
      error: (error) => {
        this.app.processError(error);
      }
    });
  }
}
