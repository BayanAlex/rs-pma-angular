import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthData, LoginResponse } from 'src/app/interfaces/http.interfaces';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/app.interfaces';


@Injectable()
export class HttpService {
  private serverUrl = 'https://striped-ship-production.up.railway.app';
  public token = '';

  constructor(private httpClient: HttpClient) {}

  convertError(error: HttpErrorResponse, category: string): Error {
    return new Error(error.error.message, { cause: `${category}.${error.status}` });
  }

  getUser(userId: string): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }),
    };

    return this.httpClient
      .get<User>(`users/${userId}`, httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "GET_USER"))));
  }

  login(loginData: AuthData): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }),
    };

    return this.httpClient
      .post<LoginResponse>('auth/signin', loginData, httpOptions)
      .pipe(
        map((response) => {
          this.token = response.token;
          localStorage.setItem('token', response.token);
        }),
        mergeMap(() => {
          return this.httpClient.get<User[]>('users', httpOptions);
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
    const httpOptions = {
      headers: new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }),
    };

    return this.httpClient
      .post<void>('auth/signup', signUpData, httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "SIGNUP"))));
  }

  saveProfile(userId: string, userData: AuthData): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }),
    };

    return this.httpClient
      .put<User>(`users/${userId}`, userData, httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "PROFILE"))));
  }

  deleteAccount(userId: string): Observable<void> {
    const httpOptions = {
      headers: new HttpHeaders({
        'accept': 'application/json',
      }),
    };

    return this.httpClient
      .delete<void>(`users/${userId}`, httpOptions)
      .pipe(catchError((error) => throwError(() => this.convertError(error, "DELETE"))));
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
