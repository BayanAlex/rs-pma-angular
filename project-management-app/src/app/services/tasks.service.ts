import { Injectable } from '@angular/core';
import { forkJoin, map, mergeMap, Observable } from 'rxjs';
import { CheckItem, CheckList, Task, TaskOrderRequest } from 'src/app/interfaces/app.interfaces';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(
    private httpService: HttpService,
  ) { }
  
  createCheckList(checkList: CheckList): Observable<CheckList> {
    return forkJoin(checkList.map((item: CheckItem) => {
        delete item._id;
        return this.httpService.post<CheckItem>('points', item, 'POINT');
      })
    );
  }

  getCheckList(taskId :string): Observable<CheckList> {
    return this.httpService.get<CheckList>(`points/${taskId}`, 'POINT');
  }

  editCheckItem(id: string, title: string, done: boolean): Observable<CheckItem> {
    return this.httpService.patch<CheckItem>(`points/${id}`, { title, done }, 'POINT');
  }

  deleteCheckItem(id: string): Observable<void> {
    return this.httpService.delete(`points/${id}`, 'POINT');
  }

  searchTask(searchValue: string, userId: string): Observable<Task[]> {
    return this.httpService
      .get<Task[]>('tasksSet', 'TASK', { search: searchValue })
      .pipe(
        map((tasks: Task[]) => tasks.filter((task: Task) => task.userId === userId))
      );
  }

  getTasks(boardId :string): Observable<Task[]> {
    return this.httpService.get<Task[]>(`tasksSet/${boardId}`, 'TASK');
  }

  updateTasksOrder(tasks: Task[]): Observable<Task[]> {
    const tasksUpdateData: TaskOrderRequest[] = tasks.map((task) => ({ _id: task._id, order: task.order, columnId: task.columnId }));
    return this.httpService.patch<Task[]>('tasksSet', tasksUpdateData, 'TASK');
  }

  createTask(title: string, description: string, boardId: string, columnId: string, order: number, userId: string): Observable<Task> {
    const task: Omit<Task, '_id' | 'boardId' | 'columnId' | 'checkList'> = { title, description: !!description ? description : ' ', order, userId, users: [] };
    return this.httpService
      .post<Task>(`boards/${boardId}/columns/${columnId}/tasks`, task, 'TASK')
      .pipe(
        map((task: Task) => {
          if (task.description === ' ') {
            task.description = ''; // Backend reply hangs when passing empty description
          }
          return task;
        })
      );
  }

  editTask(title: string, description: string, boardId: string, columnId: string, taskId: string, order: number, userId: string): Observable<Task> {
    const task: Omit<Task, '_id' | 'boardId' | 'checkList'> = { title, description: !!description ? description : ' ', order, columnId, userId, users: [] };
    return this.httpService
      .put<Task>(`boards/${boardId}/columns/${columnId}/tasks/${taskId}`, task, 'TASK')
      .pipe(
        map((task: Task) => {
          if (task.description === ' ') {
            task.description = ''; // Backend reply hangs when passing empty description
          }
          return task;
        })
      );
  }

  deleteTask(boardId: string, columnId: string, taskId: string): Observable<void> {
    return this.httpService
      .get<Task>(`boards/${boardId}/columns/${columnId}/tasks/${taskId}`, 'TASK')
      .pipe(
        mergeMap((task) => {
          if (!task)
            throw new Error('Task was not found', { cause: 'TASK.404' });
          return this.httpService.delete(`boards/${boardId}/columns/${columnId}/tasks/${taskId}`, 'TASK');
        })
    );
  }
}
