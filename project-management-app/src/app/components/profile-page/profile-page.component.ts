import { Component, Output } from '@angular/core';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  standalone: false
})
export class ProfilePageComponent {
  @Output() pendingRequest = false;

  constructor(
    private appService: AppService,
    private authService: AuthService,
  ) { }

  deleteAccount(): void {
    this.appService.showConfirmDialog('PROFILE_PAGE.DELETE_CONFIRM_TEXT', 'PROFILE_PAGE.DELETE_CONFIRM_TITLE').subscribe((confirm) => {
      if (confirm) {
        this.pendingRequest = true;
        this.appService.deleteAccount().subscribe({
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
    if (!this.authService.user())
      return;
    this.pendingRequest = true;
    this.authService.saveProfile(this.authService.user()!._id, data).subscribe({
      next: () => {
        this.pendingRequest = false;
        this.appService.showMessage('PROFILE_PAGE.SAVED_MESSAGE');
      },
      error: (error) => {
        this.pendingRequest = false;
        throw error;
      }
    });
  }
}
