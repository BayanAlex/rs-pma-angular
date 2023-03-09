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
  _id: string,
  name: string;
  login: string,
}

export interface ConfirmDialogData {
  title: string;
  text: string;
}

export interface EditBoardData {
  dialogTitle: string;
  boardTitle: string;
}

export interface Board {
  _id: string;
  title: string;
  owner: string;
  users: string[];
}
