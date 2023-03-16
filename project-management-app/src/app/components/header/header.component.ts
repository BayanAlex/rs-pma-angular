import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Task } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { HttpService } from 'src/app/services/http/http.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  searchMode = false;
  searchTimer: ReturnType<typeof setTimeout>;
  searchResults: Task[] = [];
  searchFormControl = new FormControl('');
  @ViewChild("searchInput") searchInput: ElementRef;

  constructor (public translate: TranslateService, public app: AppService, private http: HttpService, public router: Router) {}

  ngOnInit(): void {

  }

  searchItemSelected(index: number) {
    const task = this.searchResults[index];
    this.router.navigate(['boards', task.boardId, { columnId: task.columnId, taskId: task._id }]);
    this.searchResults = [];
  }

  toggleSearchMode() {
    this.searchMode = !this.searchMode;
    if (this.searchMode) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 0);
    }
  }

  createBoard() {
    this.app.createBoard();
  }

  createColumn() {
    this.app.createColumn();
  }

  auth() {
    if(this.app.isLoggedIn) {
      this.logout();
    } else {
      this.app.openLoginPage();
    }
  }

  logout() {
    this.app.showConfirmDialog('LOGOUT.TEXT').subscribe((confirm: boolean) => {
      if (confirm) {
        this.app.logout('/');
      }
    });
  }

  searchTask(value: string) {
    this.http.searchTask(value).subscribe({
      next: (tasks: Task[]) => {
        this.searchResults = tasks;
      },
      error: (error) => {
        this.app.processError(error);
      }
    });
  }

  onSearchInputChange(event: Event) {
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
