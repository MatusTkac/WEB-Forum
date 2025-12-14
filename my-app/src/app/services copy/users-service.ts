import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../entities/user';
import { catchError, EMPTY, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../entities/auth';
import { MessageService } from './message-service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private messageService = inject(MessageService);
  private users = [
    new User('JankoService','janko@jano.sk'),
    new User('MarienkaService','maria@jano.sk',2, new Date(), true,'mojeTajneHeslo' )];
//  private token: string = '';
  public loggedUserName = signal<string>('');
  public loggedIn = computed(() => !!this.loggedUserName());
  
  private set token(value: string) {
    localStorage.setItem('umToken', value);
  }
  private get token() {
    return localStorage.getItem('umToken') || '';
  }
  private set userName(value: string) {
    localStorage.setItem('umUserName', value);
    this.loggedUserName.set(value);
  }
  private get userName() {
    return localStorage.getItem('umUserName') || '';
  }

  constructor(private http: HttpClient){}

  getUsersSimple(): User[] {
    return this.users;
  }

  getUsersLocal(): Observable<User[]> {
    return of(this.users);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:8080/users').pipe(
      map(jsonUsers => jsonUsers.map(user => User.clone(user))),
      catchError(err => this.processErrors(err))
    );
  }

  getExtendedUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:8080/users/' + this.token).pipe(
      map(jsonUsers => jsonUsers.map(user => User.clone(user))),
      catchError(err => this.processErrors(err))
    );
  }
  getUser(id: number): Observable<User> {
    return this.http.get<User>('http://localhost:8080/user/' + id + '/' + this.token).pipe(
      map(user => User.clone(user)),
      catchError(err => this.processErrors(err))
    );
  }

  login(auth:Auth): Observable<boolean> {
    return this.http.post('http://localhost:8080/login', auth, {responseType: 'text'}).pipe(
      tap(token => {
        this.token = token;
        this.userName = auth.name;
      }),
      map(token => {
        this.messageService.printInfo("Login successfull");
        return true;
      }),
      catchError(err => this.processErrors(err))
    );
  }

  logout():Observable<boolean> {
    return this.http.get('http://localhost:8080/logout/' + this.token).pipe(
      map(() => {
        this.token = '';
        this.userName = '';
        this.messageService.printInfo("Logout successfull");
        return true;
      }),
      catchError(err => {
        this.token = '';
        this.userName = '';
        return of(true);
      })
    );
  }

  isLoggedIn():boolean {
    return !!this.token;
  }

  register(user: User):Observable<User> {
    return this.http.post<User>('http://localhost:8080/register', user).pipe(
      catchError(err => this.processErrors(err))
    )
  }
  userConflicts(user: User): Observable<string[]> {
    return this.http.post<string[]>('http://localhost:8080/user-conflicts', user).pipe(
      catchError(err => this.processErrors(err))
    )
  }

  deleteUser(id: number):Observable<boolean> {
    return this.http.delete('http://localhost:8080/user/'+ id + '/'+ this.token).pipe(
      map(() =>{
        this.messageService.printInfo("User deleted successfully");
        return true;
      }),
      catchError(error =>this.processErrors(error))
    );
  }

  processErrors(err: any): Observable<never> {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        this.messageService.printError("Server not available");
        return EMPTY;    
      }
      if (err.status < 500) {
        const msg = err.error.errorMessage ? err.error.errorMessage : JSON.parse(err.error).errorMessage;
        this.messageService.printError(msg);
        return EMPTY; 
      }
      this.messageService.printError("Server error, contact administrator");
    }
    console.error(err);
    return EMPTY;
  }
}
