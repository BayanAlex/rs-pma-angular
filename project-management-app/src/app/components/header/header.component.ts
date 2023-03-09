import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor (public translate: TranslateService, public app: AppService, public router: Router) {}

  createBoard() {
    this.app.createBoard('');
  }

  auth() {
    if(this.app.isLoggedIn) {
      this.logout();
    } else {
      this.app.openLoginPage();
    }
  }

  logout() {
    this.app.showConfirmDialog('LOGOUT.TEXT').subscribe((confirm) => {
      if (confirm) {
        this.app.logout('/');
      }
    });
  }
}
