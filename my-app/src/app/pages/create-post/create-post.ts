import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '../../services/posts-service';
import { Post } from '../../entities/post';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '../../services/users-service';

@Component({
  selector: 'app-create-post',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.scss']
})
export class CreatePost {
  private fb = inject(FormBuilder);
  private postsService = inject(PostsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private usersService = inject(UsersService);

  private replyToId?: number;

  errorMsg = signal('');
  submitting = signal(false);

  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    text: ['', [Validators.required, Validators.minLength(1)]]
  });

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const replyToTitle = params.get('replyToTitle');
      const replyToAuthor = params.get('replyToAuthor');
      const replyToIdRaw = params.get('replyToId');

      this.replyToId = replyToIdRaw ? Number(replyToIdRaw) : undefined;

      if (replyToTitle) {
        this.postForm.patchValue({
          title: `Re: ${replyToTitle}`
        });
      }
      if (replyToAuthor) {
        this.postForm.patchValue({
          text: `@${replyToAuthor} `
        });
      }
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    // Trim whitespace
    const title = this.postForm.value.title.trim();
    const text = this.postForm.value.text.trim();

    if (!title || !text) {
      this.errorMsg.set('Title and text cannot be empty or contain only whitespace.');
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');

    const savedUserName = typeof localStorage !== 'undefined' ? localStorage.getItem('umUserName') : '';
    const author = this.usersService.loggedUserName() || savedUserName || '';
    if (!author) {
      this.submitting.set(false);
      this.errorMsg.set('Please login first.');
      this.router.navigate(['/login']);
      return;
    }
    const newPost = new Post(title, text, author || undefined, this.replyToId);

    this.postsService.createPost(newPost).subscribe({
      next: (createdPost) => {
        this.submitting.set(false);
        this.router.navigate(['/forum']);
      },
      error: (err) => {
        this.errorMsg.set('Failed to create post. Please try again.');
        this.submitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/forum']);
  }
}