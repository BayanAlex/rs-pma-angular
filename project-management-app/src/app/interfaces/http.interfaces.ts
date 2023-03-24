export interface AuthData {
  name?: string;
  login: string,
  password: string,
}

export interface LoginResponse {
  token: string;
}
