import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Board } from 'src/app/interfaces/app.interfaces';
import { AppService } from './app.service';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  constructor(private http: HttpService, private app: AppService) { }

  getBoards(): Observable<Board[]> {
    return this.http.getBoards(this.app.user._id);
  }
}
