export interface InputError {
    message: string,
    value: {
        value: string
    },
  }

export interface InputsSettings {
  [key: string]: {
      minlength: number,
  },
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
  name: string,
  login: string,
}

export interface ConfirmDialogData {
  title: string,
  text: string,
}

export interface EditTitleData {
  dialogTitle: string,
  title: string,
  placeholder: string,
}

export interface EditTaskData {
  dialogTitle: string,
  boardTitle: string,
  columnTitle: string,
  title: string,
  titlePlaceholder: string,
  description: string,
  descriptionPlaceholder: string,
  checkList: CheckList,
}

export interface EditTaskResult {
  title: string,
  description: string,
  checkList: CheckList,
}

export interface Board {
  _id: string,
  title: string,
  owner: string,
  users: string[],
}

export interface Column {
  _id: string,
  title: string,
  order: number,
  boardId: string,
}

export interface TaskOrderRequest {
  _id: string,
  columnId: string,
  order: number,
}

export interface TasksColumn extends Column {
  editMode: boolean,
  tasks: Task[],
}

export interface TasksPageData {
  boardTitle: string,
  tasksColumns: TasksColumn[],
}

export interface Task {
  _id: string,
  title: string,
  order: number,
  boardId: string,
  columnId: string,
  description: string,
  userId: string,
  users: string[],
}

export interface CheckItem {
  _id?: string,
  title: string,
  boardId: string,
  taskId: string,
  done: boolean,
}

export type CheckList = CheckItem[]
