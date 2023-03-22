import { ErrorHandler, Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

  constructor(private app: AppService) { }

  handleError(error: Error) {
    this.app.processError(error);
    console.log(error);
  }
}
