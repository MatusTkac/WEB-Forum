import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../entities/user';
import { catchError, EMPTY, map, mergeMap, Observable, of, tap } from 'rxjs';
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

  private get hasLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
  
  private set token(value: string) {
    if (!this.hasLocalStorage) return;
    localStorage.setItem('umToken', value);
  }
  private get token() {
    if (!this.hasLocalStorage) return '';
    return localStorage.getItem('umToken') || '';
  }
  private set userName(value: string) {
    if (this.hasLocalStorage) {
      localStorage.setItem('umUserName', value);
    }
    this.loggedUserName.set(value);
  }
  private get userName() {
    if (!this.hasLocalStorage) return '';
    return localStorage.getItem('umUserName') || '';
  }

  constructor(private http: HttpClient){
    this.loggedUserName.set(this.userName);
  }

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
    return this.http.get<User[]>('/users.json').pipe(
      map(jsonUsers => jsonUsers.map(user => User.clone(user))),
      map(users => users.find(u => u.name === auth.name && u.password === auth.password) || null),
      tap(user => {
        if (user) {
          this.token = 'mock-token';
          this.userName = auth.name;
        }
      }),
      mergeMap(user => {
        if (!user) {
          this.messageService.printError('Invalid username or password');
          return EMPTY;
        }
        this.messageService.printInfo("Login successfull");
        return of(true);
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
        let msg: string | undefined;
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
      this.messageService.printError("Server error, contact administrator");
    }
    console.error(err);
    return EMPTY;
  }
}
