import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsersService } from '../../services/users-service';

// Komponenta pre navigačný panel - asi len horná lišta s tlačidlami
@Component({
  selector: 'app-navbar',
  // importujeme Material moduly aby sme mohli používať tlačidla, ikony a toolbar
  imports: [MatToolbarModule, MatIcon, MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html', // HTML šablóna pre navigáciu
  styleUrl: './navbar.scss' // CSS štýly pre navigáciu
})
export class Navbar {
  // servisa ktorý má na starosti užívateľov
  usersService = inject(UsersService);
  // router pre navigáciu medzi stránkami
  router = inject(Router);
  // berieme si meno prihláseneho užívateľa z usersService
  loggedUser = this.usersService.loggedUserName;
  
  // funkcia na odhlásenie - asi vyčisti údaje a pošle nás na login
  logout() {
    this.usersService.logout().subscribe(success => this.router.navigateByUrl('/login'));
  }
}
