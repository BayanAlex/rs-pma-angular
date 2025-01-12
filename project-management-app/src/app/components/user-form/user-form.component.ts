import { Component, OnInit, input, output } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthData } from 'src/app/interfaces/http.interfaces';
import { InputsSettings, InputError } from 'src/app/interfaces/app.interfaces';
import { AppService } from 'src/app/services/app.service';
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: false
})
export class UserFormComponent implements OnInit {
  readonly type = input<string>();
  readonly pendingSubmit = input<boolean>();
  readonly formSubmit = output<AuthData>();
  readonly deleteAccount = output<void>();

  form: FormGroup;
  hidePassword = true;
  hideRepeatPassword = true;
  hideDeleteUserButton = true;
  userDataSubscription: Subscription;

  constructor(private app: AppService) {}

  togglePassword(inputName: string): void {
    if (inputName === 'password') {
      this.hidePassword = !this.hidePassword;
    } else if (inputName === 'repeatPassword') {
      this.hideRepeatPassword = !this.hideRepeatPassword;
    }
  }

  LOGIN_MIN_LENGTH = 3;
  USERNAME_MIN_LENGTH = 2;
  PASSWORD_MIN_LENGTH = 8;
  INPUT_MAXLENGTH = 30;

  inputsSettings: InputsSettings = {
    login: {
      minlength: this.LOGIN_MIN_LENGTH,
    },
    username: {
      minlength: this.USERNAME_MIN_LENGTH,
    },
    password: {
      minlength: this.PASSWORD_MIN_LENGTH,
    },
    repeatPassword: {
      minlength: this.PASSWORD_MIN_LENGTH,
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      login: new FormControl(
        '',
        this.type() === 'login' ? [Validators.required, Validators.maxLength(this.INPUT_MAXLENGTH)] : [
          Validators.required,
          Validators.minLength(this.inputsSettings.login.minlength),
          Validators.maxLength(this.INPUT_MAXLENGTH),
          this.allowedSymbolsValidator()
        ]
      ),
      username: this.type() === 'login' ? new FormControl(null) : new FormControl(
        '',
        [Validators.required, Validators.minLength(this.inputsSettings.username.minlength), Validators.maxLength(this.INPUT_MAXLENGTH)]
      ),
      password: new FormControl(
        '',
        this.type() === 'login' ? [Validators.required, Validators.maxLength(this.INPUT_MAXLENGTH), this.allowedSymbolsValidator()] : [
          Validators.required, Validators.minLength(this.inputsSettings.password.minlength),
          this.passwordStrengthValidator(), Validators.maxLength(this.INPUT_MAXLENGTH),
          this.allowedSymbolsValidator()
        ]
      ),
      repeatPassword: this.type() === 'login' ? new FormControl(null) : new FormControl(
        '',
        [Validators.required, this.passwordsMatchValidator()]
      ),
    });

    if (this.type() === 'profile') {
      this.userDataSubscription = this.app.userData$.subscribe({
        next: (user) => {
          this.form.controls['login'].setValue(user.login);
          this.form.controls['username'].setValue(user.name);
        },
        error: (error) => {
          this.app.showErrorMessage(error);
        }
      });
      this.app.updateUserData();
    }
  }

  allowedSymbolsValidator(): ValidatorFn {
    return (control: AbstractControl) : ValidationErrors | null => {
      const value = control.value;
      if (!value) {
          return null;
      }
      const passwordValid = !(/[^0-9A-Za-z!@#$%&*()_\-+={[}\]|\:;"'<,>.?\/\\~`]+/.test(value));
      return !passwordValid ? { allowedSymbols: true } : null;
    }
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl) : ValidationErrors | null => {
      const value = control.value;
      if (!value) {
          return null;
      }
      const hasUpperCase = /[A-Z]+/.test(value);
      const hasLowerCase = /[a-z]+/.test(value);
      const hasNumber = /[0-9]+/.test(value);
      const passwordValid = hasUpperCase && hasLowerCase && hasNumber;
      return !passwordValid ? { passwordStrength: true } : null;
    }
  }

  passwordsMatchValidator(): ValidatorFn {
    return (control: AbstractControl) : ValidationErrors | null => {
      const value = control.value;
      if (!value) {
          return null;
      }
      return value !== this.form.value.password ? { passwordsMatch: true } : null;
    }
  }

  onSubmit(): void {
    const data: AuthData = { name: this.form.value.username, login: this.form.value.login, password: this.form.value.password };
    this.formSubmit.emit(data);
  }

  onDeleteAccount(): void {
    this.deleteAccount.emit();
  }

  getInputErrorMessage(inputName: string, groupName: string): InputError {
    let error: InputError = {
      message: '',
      value: {
        value: ''
      }
    };
    const input = this.form.controls[inputName];

    if (input.hasError('required')) {
      error.message = `INPUTS.ERROR_MESSAGES.REQUIRED.${groupName}`;
    } else if (input.hasError('allowedSymbols')) {
      error.message = `INPUTS.ERROR_MESSAGES.SYMBOLS.${groupName}`;
    } else if (input.hasError('minlength')) {
      error.message = `INPUTS.ERROR_MESSAGES.MINLENGTH.${groupName}`;
      error.value.value = this.inputsSettings[inputName].minlength.toString();
    } else if (input.hasError('maxlength')) {
      error.value.value = this.INPUT_MAXLENGTH.toString();
      error.message = `INPUTS.ERROR_MESSAGES.MAXLENGTH.${groupName}`;
    } else if (input.hasError('passwordStrength')) {
      error.message = `INPUTS.ERROR_MESSAGES.STRENGTH.${groupName}`;
    } else if (input.hasError('passwordsMatch')) {
      error.message = `INPUTS.ERROR_MESSAGES.MATCH.${groupName}`;
    }

    return error;
  }
}
