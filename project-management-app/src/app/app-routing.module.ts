import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { catchError, mergeMap, of, tap, throwError } from 'rxjs';
import { BoardsPageComponent } from './components/boards-page/boards-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { SignUpPageComponent } from './components/signup-page/signup-page.component';
import { TasksPageComponent } from './components/tasks-page/tasks-page.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { Board, Column, TasksPageData } from './interfaces/app.interfaces';
import { AppService } from './services/app.service';
import { isLoggedInGuard, isNotLoggedInGuard } from './services/auth-guard';
import { BoardsService } from './services/boards.service';
import { TasksService } from './services/tasks.service';

const resolveBoards: ResolveFn<Board[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const boardsService = inject(BoardsService);
  const app = inject(AppService);
  return boardsService.getBoards().pipe(
    catchError((error, caught) => {
      app.processError(error);
      app.gotoPage('/');
      return caught;
    })
  );
};

const resolveColumns: ResolveFn<TasksPageData> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const tasksService = inject(TasksService);
  const app = inject(AppService);
  const boardId = route.url[route.url.length - 1].path;
  return tasksService
    .getColumns(boardId).pipe(
      catchError((error, caught) => {
        app.processError(error);
        app.gotoPage('/');
        return caught;
      })
    );
};

const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'login', component: LoginPageComponent, canActivate: [isNotLoggedInGuard] },
  { path: 'signup', component: SignUpPageComponent, canActivate: [isNotLoggedInGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [isLoggedInGuard] },
  { path: 'boards', component: BoardsPageComponent, resolve: { boards: resolveBoards }, canActivate: [isLoggedInGuard] },
  { path: 'boards/:id', component: TasksPageComponent, resolve: { tasksPageData: resolveColumns }, canActivate: [isLoggedInGuard] },
  { path: '**', component: NotFoundPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
