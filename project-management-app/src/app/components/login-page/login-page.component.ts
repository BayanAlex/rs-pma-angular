import { Component, Output } from '@angular/core';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { AppService } from 'src/app/services/app.service';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  @Output() pendingRequest = false;

  constructor(private app: AppService) { }

  login(data: AuthData) {
    delete data.name;
    this.pendingRequest = true;
    this.app.login(data).subscribe({
      next: () => {
        this.pendingRequest = false;
      },
      error: (error) => {
        this.pendingRequest = false;
        this.app.processError(error);
      }
    });
  }
}
