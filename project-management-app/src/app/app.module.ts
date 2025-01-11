import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material.module';
import { TranslationModule } from './modules/translation/translation.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from './modules/http/http.module';
import { SignUpPageComponent } from './components/signup-page/signup-page.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { BoardsPageComponent } from './components/boards-page/boards-page.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { BoardComponent } from './components/board/board.component';
import { EditTitleDialogComponent } from './components/edit-title-dialog/edit-title-dialog.component';
import { TasksPageComponent } from './components/tasks-page/tasks-page.component';
import { EditTaskDialogComponent } from './components/edit-task-dialog/edit-task-dialog.component';
import { GlobalErrorHandlerService } from './services/global-error-handler.service';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginPageComponent,
    WelcomePageComponent,
    SignUpPageComponent,
    UserFormComponent,
    ProfilePageComponent,
    ConfirmDialogComponent,
    BoardsPageComponent,
    NotFoundPageComponent,
    BoardComponent,
    EditTitleDialogComponent,
    EditTaskDialogComponent,
    TasksPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslationModule,
    HttpModule,
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
