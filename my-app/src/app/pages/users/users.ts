import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { User } from '../../entities/user';
import { UsersService } from '../../services/users-service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-users',
  imports: [AsyncPipe],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {

  usersService = inject(UsersService);
  users = signal([
    new User('Janko','janko@jano.sk'),
    new User('Marienka','maria@jano.sk',2, new Date(),true,'mojeTajneHeslo' )]);
  title = "Nazov";
  selectedUser = signal<User|undefined>(undefined);
  users$?: Observable<User[]>;
  errorMsg = signal('');

  ngOnInit(): void {
//    this.users.set(this.usersService.getUsersSimple()); //synchrónny prístup
    this.usersService.getUsers().subscribe({
      next: users => this.users.set(users),
      error: err => this.errorMsg.set("Server nedostupný!")
    });
//    this.users$ = this.usersService.getUsers();
  }

  selectUser(u: User) {
    this.selectedUser.set(u);
  }
}
