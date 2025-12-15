import { Component, inject, OnInit, signal } from '@angular/core';
import { Post } from '../../entities/post';
import { PostsService } from '../../services/posts-service';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

// komponenta na zobrazenie fóra - stránka s príspevkami
@Component({
  selector: 'app-forum',
  // importujeme Material moduly na karty, tlačidlá, ikony a DatePipe na formátovanie dátumov
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './forum.html', // HTML šablóna
  styleUrls: ['./forum.scss'] // CSS štýly
})
export class Forum implements OnInit {
  // servisa na prácu s príspevkami - asi na sťahovanie a mazanie
  postsService = inject(PostsService);
  // router na navigáciu medzi stránkami
  router = inject(Router);
  
  // signal na uloženie zoznamu príspevkov - na začiatku prázdne pole
  posts = signal<Post[]>([]);
  // signal na chybovú správu - keď sa niečo pokazí
  errorMsg = signal('');
  // signal na kontrolu či sa načítavajú príspevky
  loading = signal(false);

  // ngOnInit - táto funkcia sa spustí keď sa komponenta vytvorí
  ngOnInit(): void {
    // keď sa stránka načíta, hneď načítame príspevky
    this.loadPosts();
  }

  // funkcia na stiahnutie príspevkov zo servera
  loadPosts(): void {
    // zapneme "načítavam" stav
    this.loading.set(true);
    // zavoláme servicu aby sťahla všetky príspevky
    this.postsService.getAllPosts().subscribe({
      // ak sa to podarilo - next funkcia
      next: posts => {
        // uložíme príspevky do signalu
        this.posts.set(posts);
        // vypneme "načítavam" stav
        this.loading.set(false);
      },
      // ak sa to nepodarilo - error funkcia
      error: err => {
        // zobrazíme chybovú správu
        this.errorMsg.set("Unable to load posts. Server may be unavailable.");
        this.loading.set(false);
      }
    });
  }

  // funkcia na zmazanie príspevku
  deletePost(id: number | undefined): void {
    // ak nemáme ID, nerobíme nič
    if (!id) return;
    
    // spýtame sa užívateľa či si je istý že chce zmazať
    if (confirm('Are you sure you want to delete this post?')) {
      // zavoláme servicu na zmazanie príspevku
      this.postsService.deletePost(id).subscribe({
        // keď sa podarí zmazať
        next: () => {
          // znova načítame všetky príspevky
          this.loadPosts();
        },
        // keď sa nepodarí
        error: err => {
          // zobrazíme chybovú správu
          this.errorMsg.set("Failed to delete post.");
        }
      });
    }
  }

  // funkcia na navigáciu na stránku na vytvorenie nového príspevku
  goToCreatePost(): void {
    // navigujeme sa na /create-post
    this.router.navigate(['/create-post']);
  }
}
