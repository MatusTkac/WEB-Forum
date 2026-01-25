import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsersService } from '../../services/users-service';

// Navbar Component - top navigation bar displayed on all pages
// Shows app title, navigation links, username, and logout button
@Component({
  selector: 'app-navbar',
  // Import Material modules for toolbar, buttons, and icons
  imports: [MatToolbarModule, MatIcon, MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  // Service to check login status and handle logout
  usersService = inject(UsersService);
  // Router for navigation after logout
  router = inject(Router);
  // Get current logged in username from service
  loggedUser = this.usersService.loggedUserName;
  
  // Logout function - clears user session and redirects to login
  logout() {
    this.usersService.logout().subscribe(success => this.router.navigateByUrl('/login'));
  }
}
