import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  standalone: false
})
export class WelcomePageComponent {
  skillsCount = 14;
  skillsList: number[] = new Array(this.skillsCount).fill(0).map((v, i) => i + 1);
  techList = [
    {
      value: 'HTML',
      src: 'html.png'
    },
    {
      value: 'SCSS',
      src: 'sass.png'
    },
    {
      value: 'TypeScript',
      src: 'ts.png'
    },
    {
      value: 'Angular',
      src: 'angular.png'
    },
    {
      value: 'RxJS',
      src: 'rxjs.png'
    },
    {
      value: 'Ngx-translate',
      src: 'ngx.png'
    },
    {
      value: 'Material',
      src: 'material.png'
    },
    {
      value: 'Tailwind',
      src: 'tailwind.svg'
    },
  ]
}
