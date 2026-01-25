// Import routing components
import { Routes } from '@angular/router';
import { Forum } from './pages/forum/forum';
import { Login } from '../app/pages/login/login';
import { NotFound } from '../app/pages/not-found/not-found';
import { CreatePost } from '../app/pages/create-post/create-post';
import { authGuard } from './guards/auth.guard';

// Application Routes - defines all pages and their URLs
export const routes: Routes = [
  // Forum page - requires authentication (protected by authGuard)
  {path: 'forum', component: Forum, canActivate: [authGuard]},
  // Create/Edit Post page - requires authentication
  {path: 'create-post', component: CreatePost, canActivate: [authGuard]},
  // Login page - public, no authentication needed
  {path: 'login', component: Login},
  // Old route redirect - redirects /users-table to /forum
  {path: 'users-table', pathMatch: 'full', redirectTo: '/forum'},
  // Default route - empty URL redirects to login
  {path: '', pathMatch: 'full', redirectTo: '/login'},
  // 404 Not Found - catches all other URLs
  {path: '**', component: NotFound}
];