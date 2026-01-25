import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersService } from '../services/users-service';

// Authentication Guard - protects routes from unauthorized access
// This function checks if user is logged in before allowing access to a page
// If not logged in, user is redirected to login page
export const authGuard: CanActivateFn = (route, state) => {
  // Get the user service to check login status
  const usersService = inject(UsersService);
  // Get router to redirect if needed
  const router = inject(Router);
  
  // Check if user is logged in
  if (usersService.isLoggedIn()) {
    // User is logged in - allow access to the page
    return true;
  }
  
  // User is NOT logged in - redirect to login page
  router.navigate(['/login']);
  return false;
};
