import { Component, inject, signal } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { Auth } from '../../entities/auth';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, 
    MatInputModule, MatIconModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  usersService = inject(UsersService);
  router = inject(Router);
  hidePassword = signal<boolean>(true);
  auth: Auth = new Auth('admin1','admin1pass');

  toggleHide() {
    this.hidePassword.update(prev => !prev);
  }

  get vypisAuth() {
    return JSON.stringify(this.auth);
  }

  submit() {
    this.usersService.login(this.auth).subscribe(() => this.router.navigateByUrl('/users-table'));
  }

  getJson(obj:any) {
    return JSON.stringify(obj);
  }
}
