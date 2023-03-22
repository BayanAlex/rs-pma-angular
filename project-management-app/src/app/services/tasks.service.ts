import { Injectable } from '@angular/core';
import { catchError, map, mergeMap, Observable, throwError } from 'rxjs';
import { Board, Column, Task, TasksColumn, TasksPageData } from '../interfaces/app.interfaces';
import { AppService } from './app.service';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private http: HttpService, private app: AppService) { }

  getColumns(boardId: string): Observable<TasksPageData> {
    const tasksPageData: TasksPageData = { tasksColumns: [], boardTitle: ''};
    return this.http.getColumns(boardId).pipe(
      mergeMap((columns: Column[]) => {
        columns.forEach((column) => {
          const taskColumn: TasksColumn = {...column, editMode: false, tasks: []};
          tasksPageData.tasksColumns.push(taskColumn);
        });
        return this.http.getTasks(boardId);
      }),
      mergeMap((tasks: Task[]) => {
        tasks.forEach((task) => {
          if (task.description === ' ') {
            task.description = '';
          }
          const column = tasksPageData.tasksColumns.find((column) => column._id === task.columnId);
          if (column) {
            column.tasks.push(task);
          }
        });
        return this.http.getBoard(boardId);
      }),
      map((board: Board) => {
        tasksPageData.boardTitle = board.title;
        return tasksPageData;
      }),
      // catchError((error) => {
      //   return throwError(() => error);
      // })
    );
  }
}
