import { Component, Output } from '@angular/core';
import { HttpService } from 'src/app/services/http/http.service';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { AppService } from 'src/app/services/app.service';


@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent {
  @Output() pendingRequest = false;

  constructor(private http: HttpService, private app: AppService) { }

  deleteAccount(): void {
    this.app.showConfirmDialog('PROFILE_PAGE.DELETE_CONFIRM_TEXT', 'PROFILE_PAGE.DELETE_CONFIRM_TITLE').subscribe((confirm) => {
      if (confirm) {
        this.pendingRequest = true;
        this.app.deleteAccount().subscribe({
          next: () => this.pendingRequest = false,
          error: (error) => {
            this.pendingRequest = false;
            throw error;
          }
        });
      }
    });
  }

  saveProfile(data: AuthData): void {
    this.pendingRequest = true;
    this.http.saveProfile(this.app.user._id, data).subscribe({
      next: (user) => {
        this.pendingRequest = false;
        this.app.updateUserData(user);
        this.app.showMessage('PROFILE_PAGE.SAVED_MESSAGE');
      },
      error: (error) => {
        this.pendingRequest = false;
        throw error;
      }
    });
  }
}
