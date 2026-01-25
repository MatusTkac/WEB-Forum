package com.example.forumBE.service;

import com.example.forumBE.entity.Category;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final List<Category> categories = new ArrayList<>();

    public CategoryService() {
        // Initialize with 5 predefined forum categories
        categories.add(new Category(1L, "General Discussion", "General topics and conversations"));
        categories.add(new Category(2L, "Technology", "Tech news, programming, and IT discussions"));
        categories.add(new Category(3L, "Help & Support", "Ask for help and provide support to others"));
        categories.add(new Category(4L, "Announcements", "Important announcements and updates"));
        categories.add(new Category(5L, "Off-Topic", "Everything that doesn't fit elsewhere"));
    }

    public List<Category> getAllCategories() {
        return new ArrayList<>(categories);
    }

    public Optional<Category> getCategoryById(Long id) {
        return categories.stream()
                .filter(cat -> cat.getId().equals(id))
                .findFirst();
    }

    public Optional<Category> getCategoryByName(String name) {
        return categories.stream()
                .filter(cat -> cat.getName().equalsIgnoreCase(name))
                .findFirst();
    }

    public boolean isValidCategory(String name) {
        return categories.stream()
                .anyMatch(cat -> cat.getName().equalsIgnoreCase(name));
    }
}
