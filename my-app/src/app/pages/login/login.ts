// Import necessary Angular and Material components
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

// Login Component - handles user authentication
@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, 
    MatInputModule, MatIconModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // Service to handle user login/logout operations
  usersService = inject(UsersService);
  // Router to navigate between pages
  router = inject(Router);
  // Controls whether password is hidden (true = hidden as ***)
  hidePassword = signal<boolean>(true);
  // Object that stores username and password from the form
  auth: Auth = new Auth('','');
  // Stores error message to show user (e.g., "Invalid password")
  errorMessage = signal<string>('');

  // Toggle password visibility - switches between *** and plain text
  toggleHide() {
    this.hidePassword.update(prev => !prev);
  }

  // Helper to convert auth object to JSON string (for debugging)
  get vypisAuth() {
    return JSON.stringify(this.auth);
  }

  // Submit function - called when user clicks Login button
  submit() {
    // Clear any previous error messages
    this.errorMessage.set('');
    // Call the login service with username and password
    this.usersService.login(this.auth).subscribe({
      // If login succeeds
      next: (success) => {
        if (success) {
          // Navigate to the forum page
          this.router.navigateByUrl('/forum');
        } else {
          // Show error if credentials are wrong
          this.errorMessage.set('Invalid username or password');
        }
      },
      // If server communication fails
      error: () => {
        this.errorMessage.set('Login failed. Please try again.');
      }
    });
  }

  // Helper to convert any object to JSON string (for debugging)
  getJson(obj:any) {
    return JSON.stringify(obj);
  }
}
