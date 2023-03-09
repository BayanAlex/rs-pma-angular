import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardsPageComponent } from './components/boards-page/boards-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { SignUpPageComponent } from './components/signup-page/signup-page.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { isLoggedInGuard, isNotLoggedInGuard } from './services/auth-guard';

const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'login', component: LoginPageComponent, canActivate: [isNotLoggedInGuard] },
  { path: 'signup', component: SignUpPageComponent, canActivate: [isNotLoggedInGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [isLoggedInGuard] },
  { path: 'boards', component:  BoardsPageComponent, canActivate: [isLoggedInGuard] },
  { path: '**', component:  NotFoundPageComponent},
  //{ path: 'boards/tasks', component:  TasksPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
