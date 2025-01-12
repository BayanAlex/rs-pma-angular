import { Injectable } from '@angular/core';
import { mergeMap, Observable } from 'rxjs';
import { Board } from 'src/app/interfaces/app.interfaces';
import { AppService } from './app.service';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {
  constructor(
    private app: AppService,
    private httpService: HttpService,
  ) { }

  deleteBoard(id: string): Observable<void> {
    return this.httpService
      .get<Board>(`boards/${id}`, 'BOARD')
      .pipe(
        mergeMap((board: Board) => {
          if (!board)
            throw new Error('Board was not found', { cause: 'BOARD.404' });
          return this.httpService.delete(`boards/${id}`, 'BOARD');
        })
    );
  }

  editBoard(id: string, title: string, owner: string): Observable<Board> {
    const boardData: Omit<Board, '_id'> = {
      title,
      owner,
      users: []
    };

    return this.httpService
      .get<Board>(`boards/${id}`, 'BOARD')
      .pipe(
        mergeMap((board) => {
          if (!board)
            throw new Error('Board was not found', { cause: 'BOARD.404' });
          return this.httpService.put<Board>(`boards/${id}`, boardData, 'BOARD');
        })
    );
  }

  createBoard(title: string, owner: string): Observable<Board> {
    const board: Omit<Board, '_id'> = {
      title,
      owner,
      users: []
    };
    return this.httpService.post<Board>('boards', board, 'BOARD');
  }

  getBoards(): Observable<Board[]> {
    return this.httpService.get<Board[]>(`boardsSet/${this.app.user._id}`, 'BOARD');
  }

  getBoard(id: string): Observable<Board> {
    return this.httpService.get<Board>(`boards/${id}`, 'BOARD');
  }
}
