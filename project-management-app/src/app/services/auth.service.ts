import { Injectable } from '@angular/core';
import { map, mergeMap, Observable } from 'rxjs';
import { HttpService } from './http/http.service';
import { AuthData, LoginResponse } from '../interfaces/http.interfaces';
import { User } from '../interfaces/app.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _token = '';

  constructor(
    private httpService: HttpService,
  ) { }

  getUser(userId: string): Observable<User> {
    return this.httpService.get<User>(`users/${userId}`,  'GET_USER');
  }

  login(loginData: AuthData): Observable<User> {
    return this.httpService
      .post<LoginResponse>('auth/signin', loginData, 'LOGIN')
      .pipe(
        map((response) => {
          this._token = response.token;
          localStorage.setItem('token', response.token);
        }),
        mergeMap(() => {
          return this.httpService.get<User[]>('users', 'LOGIN');
        }),
        map((response) => {
          const userData = response.filter((user) => user.login === loginData.login)[0];
          const user: User = {...userData};
          localStorage.setItem('id', user._id);
          return user;
        })
      );
  }

  signUp(signUpData: AuthData): Observable<void> {
    return this.httpService.post<void>('auth/signup', signUpData, 'SIGNUP');
  }

  saveProfile(userId: string, userData: AuthData): Observable<User> {
    return this.httpService.put<User>(`users/${userId}`, userData, 'PROFILE');
  }

  deleteAccount(userId: string): Observable<void> {
    return this.httpService.delete(`users/${userId}`, 'DELETE_USER');
  }

  get token(): string {
    return this._token;
  }

  loadTokenFromStorage(): string {
    const token = localStorage.getItem('token');
    if (token)
      this._token = token;
    return this._token;
  }

  logout(): void {
    this._token = '';
    localStorage.removeItem('token');
  }
}
