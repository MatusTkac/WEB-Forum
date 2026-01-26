import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Post } from '../entities/post';
import { MessageService } from './message-service';

// PostsService - handles all server communication for posts
// Provides functions to get, create, update, and delete posts
@Injectable({
  providedIn: 'root'
})
export class PostsService {
  // Backend server URL
  private baseUrl = 'http://localhost:8080/api/posts';
  // Service to show error messages to user
  private messageService = inject(MessageService);
  // HTTP client to make server requests
  private http = inject(HttpClient);

  // Get authentication token from localStorage
  private getToken(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('umToken') || '';
    }
    return '';
  }

  // Create HTTP headers with Authorization token
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token
    });
  }

  // Get all posts from server
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl).pipe(
      // Convert JSON to Post objects
      map(jsonPosts => jsonPosts.map(post => Post.clone(post))),
      // Handle any errors
      catchError(err => this.processErrors(err))
    );
  }

  // Get a single post by its ID
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`).pipe(
      // Convert JSON to Post object
      map(post => Post.clone(post)),
      catchError(err => this.processErrors(err))
    );
  }

  // Create a new post on the server
  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, post).pipe(
      // Convert response to Post object
      map(createdPost => Post.clone(createdPost)),
      catchError(err => this.processErrors(err))
    );
  }

  // Update an existing post
  updatePost(id: number, post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/${id}`, post, { headers: this.getAuthHeaders() }).pipe(
      // Convert response to Post object
      map(updatedPost => Post.clone(updatedPost)),
      catchError(err => this.processErrors(err))
    );
  }

  // Delete a post by its ID
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.processErrors(err))
    );
  }

  // Handle errors from server - converts to user-friendly message
  private processErrors(err: HttpErrorResponse): Observable<never> {
    let errorMsg = 'An error occurred';
    if (err.error instanceof ErrorEvent) {
      // Client-side error (network issue, etc.)
      errorMsg = `Error: ${err.error.message}`;
    } else {
      // Server-side error (404, 500, etc.)
      if (err.status === 401) {
        errorMsg = 'Please log in to perform this action';
      } else if (err.status === 403) {
        errorMsg = err.error?.errorMessage || 'You do not have permission to perform this action';
      } else {
        errorMsg = `Server returned: ${err.status} ${err.statusText}`;
        if (err.error?.errorMessage) {
          errorMsg = err.error.errorMessage;
        } else if (err.error?.message) {
          errorMsg += ` - ${err.error.message}`;
        }
      }
    }
    // Show error message to user
    this.messageService.printError(errorMsg);
    return throwError(() => new Error(errorMsg));
  }
}