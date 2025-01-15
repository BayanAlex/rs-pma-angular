import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom, map, mergeMap, Observable, of, tap } from 'rxjs';
import { HttpService } from './http/http.service';
import { AuthData, LoginResponse } from '../interfaces/http.interfaces';
import { User } from '../interfaces/app.interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly user = signal<User | null>(null);
  public readonly isLoggedIn = computed(() => !!this.user());
  private _token = '';

  constructor(
    private httpService: HttpService,
    private router: Router,
  ) {
    this._token = localStorage.getItem('token') ?? '';
    const id = localStorage.getItem('id');
    if (!this._token || !id) {
      this.logout();
      return;
    }
    this.user.set({ _id: id, login: '', name: '' });
  }

  getUser(userId?: string): Observable<User | null> {
    let id: string | null | undefined = userId;
    if (!userId) {
      id = localStorage.getItem('id');
      if (!id)
        return of(null);
    }
    return this.httpService.get<User>(`users/${id}`, 'GET_USER').pipe(
      tap((user) => this.user.set(user))
    );
  }

  login(loginData: AuthData): Observable<User> {
    return this.httpService
      .post<LoginResponse>('auth/signin', loginData, 'LOGIN')
      .pipe(
        tap((response) => {
          this._token = response.token;
          localStorage.setItem('token', response.token);
        }),
        mergeMap(() => {
          return this.httpService.get<User[]>('users', 'LOGIN');
        }),
        map((response) => {
          const userData = response.filter((user) => user.login === loginData.login)[0];
          const user: User = {...userData};
          return user;
        }),
        tap(user => {
          localStorage.setItem('id', user._id);
          this.user.set(user);
        })
      );
  }

  signUp(signUpData: AuthData): Observable<void> {
    return this.httpService.post<void>('auth/signup', signUpData, 'SIGNUP');
  }

  saveProfile(userId: string, userData: AuthData): Observable<User> {
    return this.httpService.put<User>(`users/${userId}`, userData, 'PROFILE').pipe(
      tap((user) => this.user.set(user))
    );
  }

  deleteAccount(userId: string): Observable<void> {
    return this.httpService.delete(`users/${userId}`, 'DELETE_USER');
  }

  initUser() {
    return firstValueFrom(this.getUser());
  }

  logout(): void {
    this.user.set(null);
    this._token = '';
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  get token(): string {
    return this._token;
  }
}
