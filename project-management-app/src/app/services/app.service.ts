import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { User } from 'src/app/interfaces/app.interfaces';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  readonly langList = ['en', 'ua'];

  createBoard$ = new Subject<void>();
  createColumn$ = new Subject<void>();
  showTask$ = new Subject<{ columnId: string, taskId: string }>();

  constructor(
    private router: Router,
    private authService: AuthService,
    public translate: TranslateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    const lang = localStorage.getItem('lang');
    this.setLanguage(lang ? +lang : 0);
    this.authService.initUser();
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
      this.authService.logout();
    }
    this.showErrorMessage(error);
  }

  gotoPage(url: string): void {
    this.router.navigate([url]);
  }

  login(data: AuthData): Observable<User> {
    return this.authService.login(data)
      .pipe(
        tap(() => this.gotoPage('/boards'))
      );
  }

  deleteAccount(): Observable<void> {
    return this.authService.deleteAccount(this.authService.user()!._id)
      .pipe(
        map(() => this.authService.logout())
      );
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
    this.snackBar.open(text, buttonCaption, { verticalPosition: 'top', horizontalPosition: 'center', panelClass: 'snack-bar' });
  }

  showMessage(text: string, buttonCaption = 'DIALOG_BUTTONS.CLOSE'): void {
    this.translate.get([text, buttonCaption]).subscribe({
      next: (result) => this.showSnackBar(result[text], result[buttonCaption])
    });
  }

  showErrorMessage(error: Error, buttonCaption = 'DIALOG_BUTTONS.CLOSE'): void {
    const errorPath = `ERRORS.${error.cause}`;
    this.translate.get([errorPath, buttonCaption]).subscribe({
      next: (result) => {
        const text = result[errorPath] !== errorPath ? result[errorPath] : error.message;
        this.showSnackBar(text, result[buttonCaption]);
      }
    });
  }

  showConfirmDialog(text: string, title = ''): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title, text },
    });
    return dialogRef.afterClosed();
  }
}
