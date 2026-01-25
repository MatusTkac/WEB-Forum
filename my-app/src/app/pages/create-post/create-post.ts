// Import necessary Angular and Material components
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
import { MatSelectModule } from '@angular/material/select';
import { UsersService } from '../../services/users-service';
import { CategoryService } from '../../services/category-service';
import { Category } from '../../entities/category';

// CreatePost Component - handles both creating new posts and editing existing ones
@Component({
  selector: 'app-create-post',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.scss']
})
export class CreatePost {
  // FormBuilder - helps create reactive forms with validation
  private fb = inject(FormBuilder);
  // Service to communicate with backend for posts
  private postsService = inject(PostsService);
  // Router - navigate between pages
  private router = inject(Router);
  // Route - get URL parameters (e.g., editId, replyToId)
  private route = inject(ActivatedRoute);
  // Service to get logged in user information
  private usersService = inject(UsersService);
  // Service to get available categories
  private categoryService = inject(CategoryService);

  // ID of post being replied to (if this is a reply)
  private replyToId?: number;
  // ID of post being edited (if in edit mode)
  private editId?: number;
  // Flag to track if we're editing (true) or creating new (false)
  isEditMode = signal(false);

  // Error message to show user
  errorMsg = signal('');
  // Flag to show loading state while submitting
  submitting = signal(false);
  // List of all available categories
  categories = signal<Category[]>([]);

  // The form with three fields: title, text, and category - all required
  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    text: ['', [Validators.required, Validators.minLength(1)]],
    category: ['', [Validators.required]]
  });

  // Constructor - runs when component is created
  constructor() {
    // Load all categories from server to populate dropdown
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err)
    });

    // Listen for URL parameters to determine mode (edit, reply, or create new)
    this.route.queryParamMap.subscribe(params => {
      // Get edit parameters from URL
      const editIdRaw = params.get('editId');
      const editTitle = params.get('editTitle');
      const editText = params.get('editText');
      const editCategory = params.get('editCategory');

      // If editId exists, we're in EDIT mode
      if (editIdRaw) {
        this.editId = Number(editIdRaw);
        this.isEditMode.set(true);
        // Pre-fill form with existing post data
        this.postForm.patchValue({
          title: editTitle || '',
          text: editText || '',
          category: editCategory || ''
        });
        return;
      }

      // Get reply parameters from URL
      const replyToTitle = params.get('replyToTitle');
      const replyToAuthor = params.get('replyToAuthor');
      const replyToIdRaw = params.get('replyToId');

      this.replyToId = replyToIdRaw ? Number(replyToIdRaw) : undefined;

      // If replying, pre-fill title with "Re: original title"
      if (replyToTitle) {
        this.postForm.patchValue({
          title: `Re: ${replyToTitle}`
        });
      }
      // If replying, pre-fill text with "@author" mention
      if (replyToAuthor) {
        this.postForm.patchValue({
          text: `@${replyToAuthor} `
        });
      }
    });
  }

  // Submit function - called when user clicks Create/Update button
  onSubmit(): void {
    // Check if form is valid (all required fields filled)
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    // Remove extra spaces from title and text
    const title = this.postForm.value.title.trim();
    const text = this.postForm.value.text.trim();

    // Make sure title and text aren't just empty spaces
    if (!title || !text) {
      this.errorMsg.set('Title and text cannot be empty or contain only whitespace.');
      return;
    }

    // Show loading state
    this.submitting.set(true);
    this.errorMsg.set('');

    // Get logged in username from localStorage or service
    const savedUserName = typeof localStorage !== 'undefined' ? localStorage.getItem('umUserName') : '';
    const author = this.usersService.loggedUserName() || savedUserName || '';
    // If no user is logged in, redirect to login
    if (!author) {
      this.submitting.set(false);
      this.errorMsg.set('Please login first.');
      this.router.navigate(['/login']);
      return;
    }
    // If in EDIT mode, update existing post
    if (this.isEditMode() && this.editId) {
      const updatedPost = new Post(title, text, author || undefined, this.replyToId, this.editId, this.postForm.value.category);
      // Call server to update the post
      this.postsService.updatePost(this.editId, updatedPost).subscribe({
        next: () => {
          // Success - go back to forum
          this.submitting.set(false);
          this.router.navigate(['/forum']);
        },
        error: (err) => {
          // Error - show message to user
          this.errorMsg.set('Failed to update post. Please try again.');
          this.submitting.set(false);
        }
      });
    } else {
      // If in CREATE mode, create new post
      const newPost = new Post(title, text, author || undefined, this.replyToId, undefined, this.postForm.value.category);
      // Call server to create the post
      this.postsService.createPost(newPost).subscribe({
        next: (createdPost) => {
          // Success - go back to forum
          this.submitting.set(false);
          this.router.navigate(['/forum']);
        },
        error: (err) => {
          // Error - show message to user
          this.errorMsg.set('Failed to create post. Please try again.');
          this.submitting.set(false);
        }
      });
    }
  }

  // Cancel function - goes back to forum without saving
  cancel(): void {
    this.router.navigate(['/forum']);
  }
}