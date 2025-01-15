import { ErrorHandler, Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

  constructor(private appService: AppService) { }

  handleError(error: Error) {
    this.appService.processError(error);
  }
}
