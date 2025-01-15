import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

type ErrorCode = 'BOARD' | 'COLUMN' | 'TASK' | 'POINT' | 'PROFILE' | 'DELETE_USER' | 'SIGNUP' | 'LOGIN' | 'GET_USER';

@Injectable()
export class HttpService {
  public httpRequestPending = false;

  private serverUrl = 'https://striped-ship-production.up.railway.app';
  private httpOptions = {
    headers: new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {}

  get<T extends object>(
    path: string,
    errorCode: ErrorCode,
    params: { [key: string]: string } = {}
  ): Observable<T> {
    return this.httpClient
      .get<T>(path, {...this.httpOptions, params})
      .pipe(
        catchError((error) => throwError(() => this.convertError(error, errorCode)))
      );
  }

  post<T extends object | void>(path: string, item: object, errorCode: ErrorCode): Observable<T> {
    return this.httpClient
      .post<T>(path, item, this.httpOptions)
      .pipe(
        catchError((error) => throwError(() => this.convertError(error, errorCode)))
      );
  }

  patch<T extends object | object[]>(
    path: string,
    item: T extends object[] ? Partial<T[number]>[] : Partial<T>,
    errorCode: ErrorCode
  ): Observable<T> {
    return this.httpClient
      .patch<T>(path, item, this.httpOptions)
      .pipe(
        catchError((error) => throwError(() => this.convertError(error, errorCode)))
      );
  }

  put<T extends object>(path: string, item: Partial<T>, errorCode: ErrorCode): Observable<T> {
    return this.httpClient
      .put<T>(path, item, this.httpOptions)
      .pipe(
        catchError((error) => throwError(() => this.convertError(error, errorCode)))
      );
  }

  delete(path: string, errorCode: ErrorCode): Observable<void> {
    return this.httpClient
      .delete<void>(path, this.httpOptions)
      .pipe(
        catchError((error) => throwError(() => this.convertError(error, errorCode)))
      );
  }

  get baseUrl(): string {
    return this.serverUrl;
  }

  private convertError(error: HttpErrorResponse | Error, category: string): Error {
    if (!(error instanceof HttpErrorResponse)) {
      return error;
    }
    const cause = error.status === 403 ? 'TOKEN' : `${category}.${error.status}`;
    return new Error(error?.error?.message ?? error.message, { cause });
  }
}
