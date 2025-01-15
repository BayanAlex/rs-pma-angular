import { Injectable } from '@angular/core';
import { map, mergeMap, Observable } from 'rxjs';
import { Board, Column, Task, TasksColumn, TasksPageData } from 'src/app/interfaces/app.interfaces';
import { HttpService } from './http/http.service';
import { BoardsService } from './boards.service';
import { TasksService } from './tasks.service';

@Injectable({
  providedIn: 'root'
})
export class ColumnsService {

  constructor(
    private httpService: HttpService,
    private boardsService: BoardsService,
    private tasksService: TasksService,
  ) { }

  getColumns(boardId: string): Observable<TasksPageData> {
    const tasksPageData: TasksPageData = { tasksColumns: [], boardTitle: ''};
    return this.httpService.get<Column[]>(`boards/${boardId}/columns`, 'COLUMN').pipe(
      mergeMap((columns: Column[]) => {
        columns.forEach((column) => {
          const taskColumn: TasksColumn = {...column, editMode: false, tasks: []};
          tasksPageData.tasksColumns.push(taskColumn);
        });
        return this.tasksService.getTasks(boardId);
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
        return this.boardsService.getBoard(boardId);
      }),
      map((board: Board) => {
        tasksPageData.boardTitle = board.title;
        return tasksPageData;
      })
    );
  }

  updateColumnsOrder(columns: Column[]): Observable<Column[]> {
    const columnsUpdateData: Pick<Column, '_id' | 'order'>[] = columns.map((column) => ({ _id: column._id, order: column.order }));
    return this.httpService.patch<Column[]>('columnsSet', columnsUpdateData, 'COLUMN');
  }

  createColumn(title: string, order: number, boardId: string): Observable<Column> {
    const column: Omit<Column, '_id' | 'boardId'> = { title, order };
    return this.httpService.post<Column>(`boards/${boardId}/columns`, column, 'COLUMN');
  }

  editColumn(title: string, order: number, boardId: string, columnId: string): Observable<Column> {
    const column: Omit<Column, '_id' | 'boardId'> = { title, order };
    return this.httpService.put<Column>(`boards/${boardId}/columns/${columnId}`, column, 'COLUMN');
  }

  deleteColumn(boardId: string, columnId: string): Observable<void> {
    return this.httpService
      .get<Column>(`boards/${boardId}/columns/${columnId}`, 'COLUMN')
      .pipe(
        mergeMap((column) => {
          if (!column)
            throw new Error('Column was not found', { cause: 'COLUMN.404' });
          return this.httpService.delete(`boards/${boardId}/columns/${columnId}`, 'COLUMN');
        })
    );
  }
}
