import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Post } from '../entities/post';
import { MessageService } from './message-service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private baseUrl = 'http://localhost:8080/api/posts';
  private messageService = inject(MessageService);
  private http = inject(HttpClient);

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl).pipe(
      map(jsonPosts => jsonPosts.map(post => Post.clone(post))),
      catchError(err => this.processErrors(err))
    );
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`).pipe(
      map(post => Post.clone(post)),
      catchError(err => this.processErrors(err))
    );
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, post).pipe(
      map(createdPost => Post.clone(createdPost)),
      catchError(err => this.processErrors(err))
    );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => this.processErrors(err))
    );
  }

  private processErrors(err: HttpErrorResponse): Observable<never> {
    let errorMsg = 'An error occurred';
    if (err.error instanceof ErrorEvent) {
      errorMsg = `Error: ${err.error.message}`;
    } else {
      errorMsg = `Server returned: ${err.status} ${err.statusText}`;
      if (err.error?.message) {
        errorMsg += ` - ${err.error.message}`;
      }
    }
    this.messageService.printError(errorMsg);
    return throwError(() => new Error(errorMsg));
  }
}