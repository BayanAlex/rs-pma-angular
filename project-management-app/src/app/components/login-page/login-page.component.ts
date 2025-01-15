import { Component, Output } from '@angular/core';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  standalone: false
})
export class LoginPageComponent {
  @Output() pendingRequest = false;

  constructor(private appService: AppService) { }

  login(data: AuthData): void {
    delete data.name;
    this.pendingRequest = true;
    this.appService.login(data).subscribe({
      next: () => {},
      error: (error) => {
        this.pendingRequest = false;
        throw error;
      }
    });
  }
}
