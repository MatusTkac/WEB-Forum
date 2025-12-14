import { Routes } from '@angular/router';
import { Forum } from './pages/forum/forum';
import { Login } from '../app/pages/login/login';
import { NotFound } from '../app/pages/not-found/not-found';
import { CreatePost } from '../app/pages/create-post/create-post';

export const routes: Routes = [
  {path: 'forum', component: Forum},
  {path: 'create-post', component: CreatePost},
  {path: 'login', component: Login},
  {path: '', pathMatch: 'full', redirectTo: '/forum'},
  {path: '**', component: NotFound}
];