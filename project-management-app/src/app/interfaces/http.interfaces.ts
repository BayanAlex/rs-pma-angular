import { HttpErrorResponse } from "@angular/common/http";

export interface AuthData {
    name?: string;
    login: string,
    password: string,
}

export interface LoginResponse {
    token: string;
}

// export interface UserDataResponse {
//     name: string;
//     login: string,
//     _id: string,
// }
