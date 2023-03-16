import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Board } from '../interfaces/app.interfaces';
import { AppService } from './app.service';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  constructor(private http: HttpService, private app: AppService) { }

  getBoards(): Observable<Board[]> {
    return this.http.getBoards().pipe(
      catchError((error) => {
        this.app.processError(error);
        return throwError(() => error);
      })
    )
  }
}
