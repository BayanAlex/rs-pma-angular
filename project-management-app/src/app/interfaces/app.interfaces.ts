export interface InputError {
    message: string;
    value: {
        value: string
    };
  }

export interface InputsSettings {
  [key: string]: {
      minlength: number,
  };
  login: {
      minlength: number,
  },
  username: {
      minlength: number,
  },
  password: {
      minlength: number,
  },
  repeatPassword: {
      minlength: number,
  }
}

export interface User {
  name: string;
  login: string,
  _id: string,
}

export interface ConfirmDialogData {
  title: string;
  text: string;
  yesButtonCaption: string;
  noButtonCaption: string;
}
