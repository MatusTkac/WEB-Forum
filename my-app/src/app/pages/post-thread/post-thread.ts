import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '../../services/posts-service';
import { UsersService } from '../../services/users-service';
import { Post } from '../../entities/post';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-post-thread',
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './post-thread.html',
  styleUrl: './post-thread.scss'
})
export class PostThread implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postsService = inject(PostsService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  post = signal<Post | undefined>(undefined);
  replies = signal<Post[]>([]);
  loading = signal(true);
  errorMsg = signal('');

  // Simple inline reply form
  replyForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    text: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : undefined;
    if (!id) {
      this.errorMsg.set('Invalid post id.');
      this.loading.set(false);
      return;
    }

    // Load original post and its replies
    this.loading.set(true);
    this.postsService.getPost(id).subscribe({
      next: (p) => {
        this.post.set(p);
        // Load all posts to compute replies
        this.postsService.getAllPosts().subscribe({
          next: (all) => {
            const threadReplies = all.filter(r => r.replyToId === p.id);
            this.replies.set(threadReplies);
            this.loading.set(false);
          },
          error: () => {
            this.errorMsg.set('Unable to load replies.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.errorMsg.set('Post not found.');
        this.loading.set(false);
      }
    });
  }

  backToForum(): void {
    this.router.navigate(['/forum']);
  }

  getReplyCount(): number {
    return this.replies().length;
  }

  canModifyPost(post: Post): boolean {
    const currentUser = this.usersService.loggedUserName();
    return currentUser === post.author;
  }

  // Submit reply using parent's category
  submitReply(): void {
    if (this.replyForm.invalid) {
      this.replyForm.markAllAsTouched();
      return;
    }
    const original = this.post();
    if (!original || !original.id) return;

    const savedUserName = typeof localStorage !== 'undefined' ? localStorage.getItem('umUserName') : '';
    const author = this.usersService.loggedUserName() || savedUserName || '';
    if (!author) {
      this.errorMsg.set('Please login first.');
      this.router.navigate(['/login']);
      return;
    }

    const title = String(this.replyForm.value.title || '').trim();
    const text = String(this.replyForm.value.text || '').trim();
    if (!title || !text) {
      this.errorMsg.set('Title and text cannot be empty.');
      return;
    }

    const newReply = new Post(
      title,
      text,
      author || undefined,
      original.id,
      undefined,
      original.category
    );

    this.loading.set(true);
    this.postsService.createPost(newReply).subscribe({
      next: () => {
        // Reload replies
        this.postsService.getAllPosts().subscribe({
          next: (all) => {
            const threadReplies = all.filter(r => r.replyToId === original.id);
            this.replies.set(threadReplies);
            this.replyForm.reset();
            this.loading.set(false);
          },
          error: () => {
            this.errorMsg.set('Failed to refresh replies.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.errorMsg.set('Failed to create reply.');
        this.loading.set(false);
      }
    });
  }
}