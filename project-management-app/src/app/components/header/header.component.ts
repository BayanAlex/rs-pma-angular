import { Component, ElementRef, viewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Task } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http/http.service';
import { TasksService } from 'src/app/services/tasks.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  readonly searchInput = viewChild<ElementRef>('searchInput');

  searchMode = false;
  searchTimer: ReturnType<typeof setTimeout>;
  searchResults: Task[] = [];
  searchFormControl = new FormControl('');
  isLoggedIn = this.authService.isLoggedIn;

  constructor (
    public translate: TranslateService,
    public appService: AppService,
    public router: Router,
    public httpService: HttpService,
    public authService: AuthService,
    private tasksService: TasksService,
  ) {}

  searchItemSelected(index: number): void {
    const task = this.searchResults[index];
    this.router.navigate(['/boards', task.boardId]).then(() => {
      this.appService.showTask(task.columnId, task._id);
      this.searchResults = [];
    });
  }

  toggleSearchMode(): void {
    this.searchMode = !this.searchMode;
    if (this.searchMode) {
      setTimeout(() => this.searchInput()?.nativeElement.focus(), 0);
    }
  }

  createBoard(): void {
    this.appService.createBoard();
  }

  createColumn(): void {
    this.appService.createColumn();
  }

  auth(): void {
    if(this.authService.isLoggedIn()) {
      this.logout();
    } else {
      this.appService.openLoginPage();
    }
  }

  logout(): void {
    this.appService.showConfirmDialog('LOGOUT.TEXT').subscribe((confirm: boolean) => {
      if (confirm) {
        this.authService.logout();
      }
    });
  }

  searchTask(value: string): void {
    if (!this.authService.user())
      return;
    this.tasksService.searchTask(value, this.authService.user()!._id)
      .subscribe((tasks: Task[]) => this.searchResults = tasks);
  }

  onSearchInputChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchTimer);
    if (searchValue) {
      this.searchTimer = setTimeout(() => {
        this.searchTask(searchValue);
      }, 500);
    } else {
      this.searchResults = [];
    }
  }
}
