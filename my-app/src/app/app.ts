import { Component, signal } from '@angular/core';
import { Forum } from './pages/forum/forum';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from "../app/components/navbar/navbar";
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Forum],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('my-app');
  name:string = 'Peter';
  router = inject(Router);

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }
}