import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { AuthData, LoginResponse } from 'src/app/interfaces/http.interfaces';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { User, Board, Column, Task, TaskOrderRequest, CheckList, CheckItem } from 'src/app/interfaces/app.interfaces';


@Injectable()
export class HttpService {
  private serverUrl = 'https://striped-ship-production.up.railway.app';
  public token = '';
  public httpRequestPending = false;
  httpOptions = {
    headers: new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {}

  convertError(error: HttpErrorResponse | Error, category: string): Error {
    if (!(error instanceof HttpErrorResponse)) {
      return error;
    }
    let cause: string;
    if (error.status === 403) {
      cause = 'TOKEN';
    } else {
      cause = `${category}.${error.status}`;
    }
    return new Error(error?.error?.message ?? error.message, { cause });
  }

  createCheckList(checkList: CheckList): Observable<CheckList> {
    return forkJoin(checkList.map((item: CheckItem) => {
      delete item._id;
      return this.httpClient
        .post<CheckItem>('points', item, this.httpOptions)
        .pipe(catchError((error) => throwError(() => this.convertError(error, 'POINT'))));
      })
    );
  }

  getCheckList(taskId :string): Observable<CheckList> {
    return this.httpClient
      .get<CheckList>(`points/${taskId}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'POINT'))));
  }

  editCheckItem(id: string, title: string, done: boolean): Observable<CheckItem> {
    return this.httpClient
      .patch<CheckItem>(`points/${id}`, { title, done }, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'POINT'))));
  }

  deleteCheckItem(id: string): Observable<void> {
    return this.httpClient
      .delete<void>(`points/${id}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'POINT'))));
  }

  searchTask(searchValue: string, userId: string): Observable<Task[]> {
    return this.httpClient
      .get<Task[]>('tasksSet', { ...this.httpOptions, params: { search: searchValue } })
      .pipe(
        map((tasks: Task[]) => tasks.filter((task: Task) => task.userId === userId)),
        catchError((error) => throwError(() => this.convertError(error, 'TASK')))
        );
  }

  getTasks(boardId :string): Observable<Task[]> {
    return this.httpClient
      .get<Task[]>(`tasksSet/${boardId}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'TASK'))));
  }

  updateTasksOrder(tasks: Task[]): Observable<Task[]> {
    const tasksUpdateData: TaskOrderRequest[] = tasks.map((task) => ({ _id: task._id, order: task.order, columnId: task.columnId }));
    return this.httpClient
      .patch<Task[]>('tasksSet', tasksUpdateData, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'TASK'))));
  }

  createTask(title: string, description: string, boardId: string, columnId: string, order: number, userId: string): Observable<Task> {
    const task: Omit<Task, '_id' | 'boardId' | 'columnId' | 'checkList'> = { title, description: !!description ? description : ' ', order, userId, users: [] };
    return this.httpClient
      .post<Task>(`boards/${boardId}/columns/${columnId}/tasks`, task, this.httpOptions)
      .pipe(
        map((task: Task) => {
          if (task.description === ' ') {
            task.description = ''; // Backend reply hangs when passing empty description
          }
          return task;
        }),
        catchError((error) => throwError(() => this.convertError(error, 'TASK')))
      );
  }

  editTask(title: string, description: string, boardId: string, columnId: string, taskId: string, order: number, userId: string): Observable<Task> {
    const task: Omit<Task, '_id' | 'boardId' | 'checkList'> = { title, description: !!description ? description : ' ', order, columnId, userId, users: [] };
    return this.httpClient
      .put<Task>(`boards/${boardId}/columns/${columnId}/tasks/${taskId}`, task, this.httpOptions)
      .pipe(
        map((task: Task) => {
          if (task.description === ' ') {
            task.description = ''; // Backend reply hangs when passing empty description
          }
          return task;
        }),
        catchError((error) => throwError(() => this.convertError(error, 'TASK')))
      );
  }

  deleteTask(boardId: string, columnId: string, taskId: string): Observable<void> {
    return this.httpClient
      .get<Task>(`boards/${boardId}/columns/${columnId}/tasks/${taskId}`, this.httpOptions)
      .pipe(
        mergeMap((task) => {
          if (task) {
            return this.httpClient.delete<void>(`boards/${boardId}/columns/${columnId}/tasks/${taskId}`, this.httpOptions);
          } else {
           throw new Error('Task was not found', { cause: 'TASK.404' });
          }
        }),
        catchError((error) => {
          return throwError(() => this.convertError(error, 'TASK'));
        })
    );
  }

  getColumns(boardId :string): Observable<Column[]> {
    return this.httpClient
      .get<Column[]>(`boards/${boardId}/columns`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'COLUMN'))));
  }

  updateColumnsOrder(columns: Column[]): Observable<Column[]> {
    const columnsUpdateData: Pick<Column, '_id' | 'order'>[] = columns.map((column) => ({ _id: column._id, order: column.order }));
    return this.httpClient
      .patch<Column[]>('columnsSet', columnsUpdateData, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'COLUMN'))));
  }

  createColumn(title: string, order: number, boardId: string): Observable<Column> {
    const column: Omit<Column, '_id' | 'boardId'> = { title, order };
    return this.httpClient
      .post<Column>(`boards/${boardId}/columns`, column, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'COLUMN'))));
  }

  editColumn(title: string, order: number, boardId: string, columnId: string): Observable<Column> {
    const column: Omit<Column, '_id' | 'boardId'> = { title, order };
    return this.httpClient
      .put<Column>(`boards/${boardId}/columns/${columnId}`, column, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'COLUMN'))));
  }

  deleteColumn(boardId: string, columnId: string): Observable<void> {
    return this.httpClient
      .get<Column>(`boards/${boardId}/columns/${columnId}`, this.httpOptions)
      .pipe(
        mergeMap((column) => {
          if (column) {
            return this.httpClient.delete<void>(`boards/${boardId}/columns/${columnId}`, this.httpOptions);
          } else {
           throw new Error('Column was not found', { cause: 'COLUMN.404' });
          }
        }),
        catchError((error) => {
          return throwError(() => this.convertError(error, 'COLUMN'));
        })
    );
  }

  deleteBoard(id: string): Observable<void> {
    return this.httpClient
      .get<Board>(`boards/${id}`, this.httpOptions)
      .pipe(
        mergeMap((board: Board) => {
          if (board) {
            return this.httpClient.delete<void>(`boards/${id}`, this.httpOptions);
          } else {
            throw new Error('Board was not found', { cause: 'BOARD.404' });
          }
        }),
        catchError((error) => {
          return throwError(() => this.convertError(error, 'BOARD'));
        })
    );
  }

  editBoard(id: string, title: string, owner: string): Observable<Board> {
    const boardData: Omit<Board, '_id'> = {
      title,
      owner,
      users: []
    }

    return this.httpClient
      .get<Board>(`boards/${id}`, this.httpOptions)
      .pipe(
        mergeMap((board) => {
          if (board) {
            return this.httpClient.put<Board>(`boards/${id}`, boardData, this.httpOptions);
          } else {
            throw new Error('Board was not found', { cause: 'BOARD.404' });
          }
        }),
        catchError((error) => {
          return throwError(() => this.convertError(error, 'BOARD'));
        })
    );
  }

  createBoard(title: string, owner: string): Observable<Board> {
    const board: Omit<Board, '_id'> = {
      title,
      owner,
      users: []
    };
    return this.httpClient
      .post<Board>('boards', board, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'BOARD'))));
  }

  getBoards(userId: string): Observable<Board[]> {
    return this.httpClient
      .get<Board[]>(`boardsSet/${userId}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'BOARD'))));
  }

  getBoard(id: string): Observable<Board> {
    return this.httpClient
      .get<Board>(`boards/${id}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'BOARD'))));
  }

  getUser(userId: string): Observable<User> {
    return this.httpClient
      .get<User>(`users/${userId}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'GET_USER'))));
  }

  login(loginData: AuthData): Observable<User> {
    return this.httpClient
      .post<LoginResponse>('auth/signin', loginData, this.httpOptions)
      .pipe(
        map((response) => {
          this.token = response.token;
          localStorage.setItem('token', response.token);
        }),
        mergeMap(() => {
          return this.httpClient.get<User[]>('users', this.httpOptions);
        }),
        map((response) => {
          const userData = response.filter((user) => user.login === loginData.login)[0];
          const user: User = {...userData};
          localStorage.setItem('id', user._id);
          return user;
        }),
        catchError((error) => throwError(() => this.convertError(error, 'LOGIN')))
      );
  }

  signUp(signUpData: AuthData): Observable<void> {
    return this.httpClient
      .post<void>('auth/signup', signUpData, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'SIGNUP'))));
  }

  saveProfile(userId: string, userData: AuthData): Observable<User> {
    return this.httpClient
      .put<User>(`users/${userId}`, userData, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'PROFILE'))));
  }

  deleteAccount(userId: string): Observable<void> {
    return this.httpClient
      .delete<void>(`users/${userId}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, 'DELETE_USER'))));
  }

  get baseUrl(): string {
    return this.serverUrl;
  }

  getAuthorizationToken(): string {
    return this.token;
  }

  logout(): void {
    this.token = '';
    localStorage.removeItem('token');
  }
}
