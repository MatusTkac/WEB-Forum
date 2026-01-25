import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../entities/category';

// CategoryService - handles category data from server
// Categories are used to organize posts (e.g., "General", "Tech", "Sports")
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // Backend server URL for categories
  private baseUrl = 'http://localhost:8080/api/categories';

  constructor(private http: HttpClient) {}

  // Get all available categories for the forum
  // Used to populate category dropdowns in forms and filters
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }
}
