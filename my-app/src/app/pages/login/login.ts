import { Component, inject, signal } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { Auth } from '../../entities/auth';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users-service';
import { Router } from '@angular/router';

// komponenta na prihlásenie - stránka kde sa užívateľ prihlasuje
@Component({
  selector: 'app-login',
  // importujeme Material veci na karty, tlačidlá, inputy a ikony
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, 
    MatInputModule, MatIconModule, FormsModule],
  templateUrl: './login.html', // HTML šablóna
  styleUrl: './login.scss' // CSS štýly
})
export class Login {
  // servisa na prácu s užívateľmi - na prihlásenie
  usersService = inject(UsersService);
  // router na navigáciu medzi stránkami
  router = inject(Router);
  // signal na ukrytie/zobrazenie hesla
  hidePassword = signal<boolean>(true);
  // objekt Auth s menom a heslom - na začiatku má testovacie údaje
  auth: Auth = new Auth('Peter','sovy');

  // funkcia na prepnutie viditeľnosti hesla
  toggleHide() {
    // zmeníme hidePassword z true na false alebo naopak
    this.hidePassword.update(prev => !prev);
  }

  // getter na vypísanie auth objektu ako JSON - asi na debugging
  get vypisAuth() {
    return JSON.stringify(this.auth);
  }

  // funkcia na odoslanie formulára - prihlásenie
  submit() {
    // zavoláme servicu login s menom a heslom
    // keď sa prihlásenie podarí, navigujeme sa na /users-table
    this.usersService.login(this.auth).subscribe(() => this.router.navigateByUrl('/users-table'));
  }

  // pomocná funkcia na konverziu objektu na JSON string
  getJson(obj:any) {
    return JSON.stringify(obj);
  }
}
