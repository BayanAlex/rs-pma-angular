import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  requestsCount = 0;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    if(request.url.includes('/assets')) { // filter Ngx requests
      return next.handle(request);
    }
    this.httpService.httpRequestPending = true;
    this.requestsCount += 1;
    const authToken = `Bearer ${this.authService.token}`;
    const authRequest = request.clone({
      url: `${this.httpService.baseUrl}/${request.url}`,
      headers: request.headers.set('authorization', authToken)
    });
    return next.handle(authRequest).pipe(
      finalize(() => {
        this.requestsCount -= 1;
        if (this.requestsCount === 0) {
          this.httpService.httpRequestPending = false;
        }
      })
    );
  }
}
