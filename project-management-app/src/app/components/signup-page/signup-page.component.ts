import { Component, Output } from '@angular/core';
import { HttpService } from 'src/app/services/http/http.service';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import { mergeMap } from 'rxjs';


@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignUpPageComponent {
  @Output() pendingRequest = false;

  constructor(private router: Router, private http: HttpService, public app: AppService) { }

  signUp(data: AuthData) {
    this.pendingRequest = true;
    this.http.signUp(data)
    .pipe(
      mergeMap(() => {
        delete data.name;
        return this.app.login(data);
      })
    )
    .subscribe({
      next: () => {
        // this.pendingRequest = false;
      },
      error: (error) => {
        this.pendingRequest = false;
        // this.app.processError(error);
        throw error;
      }
    });
  }
}
