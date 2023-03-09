import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthData, LoginResponse } from 'src/app/interfaces/http.interfaces';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { User, Board } from 'src/app/interfaces/app.interfaces';


@Injectable()
export class HttpService {
  private serverUrl = 'https://striped-ship-production.up.railway.app';
  public token = '';
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
    return new Error(error.error.message, { cause });
  }

  deleteBoard(id: string): Observable<void> {
    return this.httpClient
      .get<Board>(`boards/${id}`, this.httpOptions)
      .pipe(
        mergeMap((board) => {
          if (board) {
            return this.httpClient.delete<void>(`boards/${id}`, this.httpOptions);
          } else {
           throw new Error('Board not found');
          }
        }),
        catchError((error) => {
          return throwError(() => this.convertError(error, "BOARD"));
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
            throw new Error('Board not found');
          }
        }),
        catchError((error) => {
          return throwError(() => this.convertError(error, "BOARD"));
        })
    );
  }

  createBoard(title: string, owner: string): Observable<Board> {
    const board: Omit<Board, '_id'> = {
      title,
      owner,
      users: []
    }
    return this.httpClient
      .post<Board>('boards', board, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "BOARD"))));
  }

  getBoards(): Observable<Board[]> {
    return this.httpClient
      .get<Board[]>('boards', this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "BOARD"))));
  }

  getUser(userId: string): Observable<User> {
    return this.httpClient
      .get<User>(`users/${userId}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "GET_USER"))));
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
        catchError((error) => throwError(() => this.convertError(error, "LOGIN")))
      );
  }

  signUp(signUpData: AuthData): Observable<void> {
    return this.httpClient
      .post<void>('auth/signup', signUpData, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "SIGNUP"))));
  }

  saveProfile(userId: string, userData: AuthData): Observable<User> {
    return this.httpClient
      .put<User>(`users/${userId}`, userData, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "PROFILE"))));
  }

  deleteAccount(userId: string): Observable<void> {
    return this.httpClient
      .delete<void>(`users/${userId}`, this.httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "DELETE_USER"))));
  }

  get baseUrl() {
    return this.serverUrl;
  }

  getAuthorizationToken() {
    return this.token;
  }

  logout() {
    this.token = '';
    localStorage.removeItem('token');
  }
}
