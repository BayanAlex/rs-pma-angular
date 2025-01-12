import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { User } from 'src/app/interfaces/app.interfaces';
import { Observable, Subscription, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root',
})
export class AppService {
  private loginState = false;
  public user: User = { name: '', login: '', _id: '' };
  public readonly langList = ['en', 'ua'];
  public userData$ = new Subject<User>();
  public createBoard$ = new Subject<void>();
  public createColumn$ = new Subject<void>();
  public showTask$ = new Subject<{ columnId: string, taskId: string }>();

  constructor(
    private router: Router,
    private authService: AuthService,
    public translate: TranslateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    const lang = localStorage.getItem('lang');
    lang !== null ? this.setLanguage(+lang) : this.setLanguage(0);
    this.updateUserData();
  }

  showTask(columnId: string, taskId: string): void {
    this.showTask$.next({ columnId, taskId });
  }

  createBoard(): void {
    this.createBoard$.next();
  }

  createColumn(): void {
    this.createColumn$.next();
  }

  processError(error: Error): void {
    if (error.cause === 'TOKEN') {
      this.logout('/');
    }
    this.showErrorMessage(error);
  }

  updateUserData(userData?: User): void {
    if (userData) {
      this.userData$.next(userData);
      return;
    }
    const token = this.authService.loadTokenFromStorage();
    const id = localStorage.getItem('id');
    if (!token || !id) {
      this.logout('/');
      return;
    }
    this.loginState = true;
    this.user._id = id;
    this.authService.getUser(id).subscribe({
      next: (user) => {
        this.user = user;
        this.userData$.next(user);
      },
      error: this.processError.bind(this)
    });
  }

  get isLoggedIn(): boolean {
    return this.loginState;
  }

  set isLoggedIn(value: boolean) {
    this.loginState = value;
  }

  gotoPage(url: string): void {
    this.router.navigate([url]);
  }

  logout(gotoUrl?: string): void {
    this.isLoggedIn = false;
    this.user._id = '';
    localStorage.removeItem('id');
    this.authService.logout();
    if (gotoUrl) {
      this.gotoPage(gotoUrl);
    }
  }

  login(data: AuthData): Observable<void> {
    return this.authService.login(data)
      .pipe(
        map(() => {
          const subscription: Subscription = this.userData$.subscribe({
            next: () => {
              this.gotoPage('/boards');
              subscription.unsubscribe();
            },
          });
          this.updateUserData();
          this.isLoggedIn = true;
        })
      )
  }

  deleteAccount(): Observable<void> {
    return this.authService.deleteAccount(this.user._id)
      .pipe(
        map(() => {
          this.logout('/');
        })
      )
  }

  setLanguage(index: number): void {
    localStorage.setItem('lang', index.toString());
    this.translate.use(this.langList[index]);
  }

  openLoginPage(): void {
    this.gotoPage('/login');
  }

  openSignUpPage(): void {
    this.gotoPage('/signup');
  }

  openEditProfilePage(): void {
    this.gotoPage('/profile');
  }

  showSnackBar(text: string, buttonCaption: string): void {
    this.snackBar.open(text, buttonCaption, { verticalPosition: 'top', horizontalPosition: 'center', panelClass: 'snack-bar' })
  }

  showMessage(text: string, buttonCaption = 'DIALOG_BUTTONS.CLOSE'): void {
    this.translate.get([text, buttonCaption]).subscribe({
      next: (result) => this.showSnackBar(result[text], result[buttonCaption])
    })
  }

  showErrorMessage(error: Error, buttonCaption = 'DIALOG_BUTTONS.CLOSE'): void {
    const errorPath = `ERRORS.${error.cause}`;
    this.translate.get([errorPath, buttonCaption]).subscribe({
      next: (result) => {
        const text = result[errorPath] !== errorPath ? result[errorPath] : error.message;
        this.showSnackBar(text, result[buttonCaption]);
      }
    })
  }

  showConfirmDialog(text: string, title = ''): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title, text },
    });
    return dialogRef.afterClosed();
  }
}
