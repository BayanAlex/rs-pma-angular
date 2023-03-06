import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthInterceptor } from '../../services/http/auth-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpService } from 'src/app/services/http/http.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    HttpService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
})
export class HttpModule { }
