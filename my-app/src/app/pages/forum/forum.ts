import { Component, inject, OnInit, signal } from '@angular/core';
import { Post } from '../../entities/post';
import { PostsService } from '../../services/posts-service';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forum',
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './forum.html',
  styleUrls: ['./forum.scss']
})
export class Forum implements OnInit {
  postsService = inject(PostsService);
  router = inject(Router);
  
  posts = signal<Post[]>([]);
  errorMsg = signal('');
  loading = signal(false);

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    this.postsService.getAllPosts().subscribe({
      next: posts => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: err => {
        this.errorMsg.set("Unable to load posts. Server may be unavailable.");
        this.loading.set(false);
      }
    });
  }

  deletePost(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this post?')) {
      this.postsService.deletePost(id).subscribe({
        next: () => {
          this.loadPosts(); // Reload posts after deletion
        },
        error: err => {
          this.errorMsg.set("Failed to delete post.");
        }
      });
    }
  }

  goToCreatePost(): void {
    this.router.navigate(['/create-post']);
  }
}
