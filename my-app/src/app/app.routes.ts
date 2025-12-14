import { Routes } from '@angular/router';
import { Users } from '../app/pages/users/users';
import { Login } from '../app/pages/login/login';
import { NotFound } from '../app/pages/not-found/not-found';

export const routes: Routes = [
  {path: 'users', component: Users},
  {path: 'login', component: Login},
  {path: '', pathMatch: 'full', redirectTo: '/users'},
  {path: '**', component: NotFound}
];