import { Component, Output } from '@angular/core';
import { HttpService } from 'src/app/services/http/http.service';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { AppService } from 'src/app/services/app.service';
import { mergeMap } from 'rxjs';


@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
  standalone: false
})
export class SignUpPageComponent {
  @Output() pendingRequest = false;

  constructor(private http: HttpService, public app: AppService) { }

  signUp(data: AuthData): void {
    this.pendingRequest = true;
    this.http.signUp(data)
    .pipe(
      mergeMap(() => {
        delete data.name;
        return this.app.login(data);
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
