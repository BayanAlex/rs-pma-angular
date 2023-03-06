import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private httpService: HttpService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    if(request.url.includes('/assets')) { //filter Ngx requests
        return next.handle(request);
    }
    const authToken = `Bearer ${this.httpService.getAuthorizationToken()}`;
    const authRequest = request.clone({
      url: `${this.httpService.baseUrl}/${request.url}`,
      headers: request.headers.set('authorization', authToken)
    });
    return next.handle(authRequest);
  }
}
