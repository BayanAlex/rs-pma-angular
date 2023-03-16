import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pick'
})
export class PickPipe implements PipeTransform {
  transform(input: any[], key: string): any {
    return input.map(value => value[key]);
  }
}
