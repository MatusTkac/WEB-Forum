import { Component, signal } from '@angular/core';
import { Users } from '../app/pages/users/users';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "../app/components/navbar/navbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Users],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('my-app');
  name:string = 'Peter';
}