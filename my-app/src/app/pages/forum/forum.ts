// Import necessary Angular and Material components
import { Component, inject, OnInit, signal } from '@angular/core';
import { Post } from '../../entities/post';
import { PostsService } from '../../services/posts-service';
import { CategoryService } from '../../services/category-service';
import { UsersService } from '../../services/users-service';
import { Category } from '../../entities/category';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Forum Component - main page that displays all forum posts
@Component({
  selector: 'app-forum',
  // Import Material modules for cards, buttons, icons, and DatePipe for formatting dates
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, FormsModule],
  templateUrl: './forum.html',
  styleUrls: ['./forum.scss']
})
export class Forum implements OnInit {
  // Service to handle post operations (get, delete)
  postsService = inject(PostsService);
  // Service to handle categories
  categoryService = inject(CategoryService);
  // Service to check logged in user (for edit/delete permissions)
  usersService = inject(UsersService);
  // Router for navigation between pages
  router = inject(Router);
  
  // Current filtered/displayed posts
  posts = signal<Post[]>([]);
  // All posts (used for filtering)
  allPosts = signal<Post[]>([]);
  // Available categories
  categories = signal<Category[]>([]);
  // Currently selected category filter (empty = show all)
  selectedCategory = '';
  // Error message to show user
  errorMsg = signal('');
  // Loading flag - true while downloading posts
  loading = signal(false);

  // ngOnInit - runs automatically when component is created
  ngOnInit(): void {
    // Load posts and categories when page loads
    this.loadPosts();
    this.loadCategories();
  }

  // Load categories from server for filter dropdown
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: categories => this.categories.set(categories),
      error: err => console.error('Failed to load categories', err)
    });
  }

  // Load all posts from server
  loadPosts(): void {
    // Show loading indicator
    this.loading.set(true);
    // Call server to get posts
    this.postsService.getAllPosts().subscribe({
      // If successful
      next: posts => {
        // Store posts
        this.allPosts.set(posts);
        // Show only top-level posts (exclude replies)
        const topLevel = posts.filter(p => !p.replyToId);
        this.posts.set(topLevel);
        // Hide loading indicator
        this.loading.set(false);
      },
      // If failed
      error: err => {
        // Show error message to user
        this.errorMsg.set("Unable to load posts. Server may be unavailable.");
        this.loading.set(false);
      }
    });
  }

  // Filter posts by selected category
  filterPosts(): void {
    if (!this.selectedCategory) {
      // No category selected - show all posts
      this.posts.set(this.allPosts());
    } else {
      // Filter to show only posts from selected category
      const filtered = this.allPosts().filter(post => post.category === this.selectedCategory);
      this.posts.set(filtered);
    }
  }

  // Delete a post
  deletePost(id: number | undefined): void {
    // Safety check - do nothing if no ID
    if (!id) return;
    
    // Ask user to confirm deletion
    if (confirm('Are you sure you want to delete this post?')) {
      // Call server to delete the post
      this.postsService.deletePost(id).subscribe({
        // If successful
        next: () => {
          // Reload all posts to refresh the list
          this.loadPosts();
        },
        // If failed
        error: err => {
          // Show error message
          this.errorMsg.set("Failed to delete post.");
        }
      });
    }
  }

  // Navigate to create new post page
  goToCreatePost(): void {
    this.router.navigate(['/create-post']);
  }

  // Open thread page to read/write replies
  replyTo(post: Post): void {
    this.openThread(post);
  }

  // Navigate to thread page for a post
  openThread(post: Post): void {
    if (!post.id) return;
    this.router.navigate([`/post/${post.id}`]);
  }

  // Navigate to create page in edit mode
  editPost(post: Post): void {
    // Pass post data as URL parameters to pre-fill form
    this.router.navigate(['/create-post'], {
      queryParams: {
        editId: post.id,
        editTitle: post.title,
        editText: post.text,
        editCategory: post.category || ''
      }
    });
  }

  // Find a post by its ID
  getPostById(id: number | undefined): Post | undefined {
    if (id == null) return undefined;
    return this.posts().find(p => p.id === id);
  }

  // Get display label for reply parent post
  getReplyLabel(replyToId: number | undefined): string {
    const parent = this.getPostById(replyToId);
    if (!parent) return replyToId != null ? `#${replyToId}` : '';
    const author = parent.author || 'unknown';
    return `#${parent.id} (${author})`;
  }

  // Get number of replies for a post
  getReplyCount(postId: number | undefined): number {
    if (!postId) return 0;
    return this.allPosts().filter(p => p.replyToId === postId).length;
  }

  // Check if current user can edit/delete this post
  canModifyPost(post: Post): boolean {
    const currentUser = this.usersService.loggedUserName();
    return currentUser === post.author;
  }
}
