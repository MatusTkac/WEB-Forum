import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostsService } from '../../services/posts-service';
import { Post } from '../../entities/post';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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

  errorMsg = signal('');
  submitting = signal(false);

  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    text: ['', [Validators.required, Validators.minLength(1)]]
  });

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

    const newPost = new Post(title, text);

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