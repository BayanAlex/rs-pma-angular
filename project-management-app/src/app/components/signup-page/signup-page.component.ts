import { Component, Output } from '@angular/core';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { AppService } from 'src/app/services/app.service';
import { mergeMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
  standalone: false
})
export class SignUpPageComponent {
  @Output() pendingRequest = false;

  constructor(
    public appService: AppService,
    private authService: AuthService,
  ) { }

  signUp(data: AuthData): void {
    this.pendingRequest = true;
    this.authService.signUp(data)
    .pipe(
      mergeMap(() => {
        delete data.name;
        return this.appService.login(data);
      })
    )
    .subscribe({
      next: () => { },
      error: (error) => {
        this.pendingRequest = false;
        throw error;
      }
    });
  }
}
