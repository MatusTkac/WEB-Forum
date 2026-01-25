import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../entities/user';
import { catchError, EMPTY, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../entities/auth';
import { MessageService } from './message-service';

// UsersService - handles user authentication and user data management
// Manages login/logout, token storage, and user information
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  // Service to show messages to user
  private messageService = inject(MessageService);
  // Backend server URL
  private baseUrl = 'http://localhost:8080';
  
  // Signal storing logged in username - accessible to other components
  public loggedUserName = signal<string>('');
  // Computed signal - true if user is logged in, false otherwise
  public loggedIn = computed(() => !!this.loggedUserName());

  // Check if localStorage is available (browser vs server-side rendering)
  private get hasLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
  
  // Store authentication token in localStorage (persists after page refresh)
  private set token(value: string) {
    if (!this.hasLocalStorage) return;
    localStorage.setItem('umToken', value);
  }
  // Get authentication token from localStorage
  private get token() {
    if (!this.hasLocalStorage) return '';
    return localStorage.getItem('umToken') || '';
  }
  // Store username in localStorage and update signal
  private set userName(value: string) {
    if (this.hasLocalStorage) {
      localStorage.setItem('umUserName', value);
    }
    this.loggedUserName.set(value);
  }
  // Get username from localStorage
  private get userName() {
    if (!this.hasLocalStorage) return '';
    return localStorage.getItem('umUserName') || '';
  }

  // Constructor - runs when service is created
  // Restores logged in state from localStorage if exists
  constructor(private http: HttpClient){
    this.loggedUserName.set(this.userName);
  }

  // Get list of all users (public data only)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      map(jsonUsers => jsonUsers.map(user => User.clone(user))),
      catchError(err => this.processErrors(err))
    );
  }

  // Get extended user information (requires authentication token)
  getExtendedUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/${this.token}`).pipe(
      map(jsonUsers => jsonUsers.map(user => User.clone(user))),
      catchError(err => this.processErrors(err))
    );
  }
  
  // Get a specific user by ID (requires authentication)
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/${id}/${this.token}`).pipe(
      map(user => User.clone(user)),
      catchError(err => this.processErrors(err))
    );
  }

  // Login user with username and password
  // Stores token and username in localStorage for persistence
  login(auth:Auth): Observable<boolean> {
    return this.http.post<any>(`${this.baseUrl}/login`, auth).pipe(
      tap(response => {
        if (response.success && response.token) {
          // Save token and username to localStorage
          this.token = response.token;
          this.userName = response.userName;
          this.messageService.printInfo("Login successful");
        }
      }),
      // Return true if login succeeded, false otherwise
      map(response => response.success),
      catchError(err => this.processErrors(err))
    );
  }

  // Logout current user
  // Clears token and username from localStorage
  logout():Observable<boolean> {
    return this.http.get(`${this.baseUrl}/logout/${this.token}`).pipe(
      map(() => {
        // Clear stored credentials
        this.token = '';
        this.userName = '';
        this.messageService.printInfo("Logout successful");
        return true;
      }),
      catchError(err => {
        // Even if server call fails, clear local credentials
        this.token = '';
        this.userName = '';
        return of(true);
      })
    );
  }

  // Check if user is currently logged in (has valid token)
  isLoggedIn():boolean {
    return !!this.token;
  }

  // Register a new user account
  register(user: User):Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, user).pipe(
      catchError(err => this.processErrors(err))
    )
  }
  
  // Check if user data conflicts with existing users (duplicate username/email)
  userConflicts(user: User): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/user-conflicts`, user).pipe(
      catchError(err => this.processErrors(err))
    )
  }

  // Delete a user account (requires authentication)
  deleteUser(id: number):Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/user/${id}/${this.token}`).pipe(
      map(() =>{
        this.messageService.printInfo("User deleted successfully");
        return true;
      }),
      catchError(error =>this.processErrors(error))
    );
  }

  // Process HTTP errors and show user-friendly messages
  // Handles different error types: network errors, client errors (4xx), server errors (5xx)
  processErrors(err: any): Observable<never> {
    if (err instanceof HttpErrorResponse) {
      // Status 0 = server not reachable (network error)
      if (err.status === 0) {
        this.messageService.printError("Server not available");
        return EMPTY;    
      }
      // Status 4xx = client error (bad request, unauthorized, etc.)
      if (err.status < 500) {
        let msg: string | undefined;
        // Try to extract error message from response
        if (err.error && typeof err.error === 'object' && 'errorMessage' in err.error) {
          msg = (err.error as any).errorMessage;
        } else if (typeof err.error === 'string') {
          try {
            msg = JSON.parse(err.error).errorMessage;
          } catch {
            msg = err.message;
          }
        } else {
          msg = err.message;
        }

        this.messageService.printError(msg || 'Request failed');
        return EMPTY; 
      }
      // Status 5xx = server error
      this.messageService.printError("Server error, contact administrator");
    }
    console.error(err);
    return EMPTY;
  }
}