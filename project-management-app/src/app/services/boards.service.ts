import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Board } from '../interfaces/app.interfaces';
import { AppService } from './app.service';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  constructor(private http: HttpService, private app: AppService) { }

  getBoards(): Observable<Board[]> {
    return this.http.getBoards(this.app.user._id).pipe(
      // catchError((error) => {
      //   return throwError(() => error);
      // })
    )
  }
}
