import { Component, ElementRef, viewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Task } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { HttpService } from 'src/app/services/http/http.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  searchMode = false;
  searchTimer: ReturnType<typeof setTimeout>;
  searchResults: Task[] = [];
  searchFormControl = new FormControl('');
  darkMode = false;
  readonly searchInput = viewChild<ElementRef>('searchInput');

  constructor (public translate: TranslateService, public app: AppService, public http: HttpService, public router: Router, private route: ActivatedRoute) {}

  switchMode(): void {
    this.darkMode = !this.darkMode;
  }

  searchItemSelected(index: number): void {
    const task = this.searchResults[index];
    this.router.navigate(['/boards', task.boardId]).then(() => {
      this.app.showTask(task.columnId, task._id);
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
    this.app.createBoard();
  }

  createColumn(): void {
    this.app.createColumn();
  }

  auth(): void {
    if(this.app.isLoggedIn) {
      this.logout();
    } else {
      this.app.openLoginPage();
    }
  }

  logout(): void {
    this.app.showConfirmDialog('LOGOUT.TEXT').subscribe((confirm: boolean) => {
      if (confirm) {
        this.app.logout('/');
      }
    });
  }

  searchTask(value: string): void {
    this.http.searchTask(value, this.app.user._id).subscribe({
      next: (tasks: Task[]) => {
        this.searchResults = tasks;
      }
    });
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
