import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsersService } from '../../services/users-service';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatIcon, MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  usersService = inject(UsersService);
  router = inject(Router);
  loggedUser = this.usersService.loggedUserName;
  
  logout() {
    this.usersService.logout().subscribe(success => this.router.navigateByUrl('/login'));
  }
}
