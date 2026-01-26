package com.example.forumBE.controller;

import com.example.forumBE.service.CategoryService;
import com.example.forumBE.service.UserService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PostController {

    private static final String JSON_FILE_PATH = "src/main/resources/posts.json";
    private static final String JSON_FILE_PATH_FROM_WORKSPACE_ROOT = "forumBE/src/main/resources/posts.json";
    private final ObjectMapper objectMapper;
    private final List<Post> posts = new ArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);
    private final Path jsonFilePath;
    private final CategoryService categoryService;
    private final UserService userService;

    public PostController(CategoryService categoryService, UserService userService) {
        this.categoryService = categoryService;
        this.userService = userService;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);

        this.jsonFilePath = resolveJsonFilePath();
        
        loadPostsFromFile();
    }

    private Path resolveJsonFilePath() {
        Path cwd = Paths.get(System.getProperty("user.dir"));
        Path direct = cwd.resolve(JSON_FILE_PATH);
        Path workspaceRootStyle = cwd.resolve(JSON_FILE_PATH_FROM_WORKSPACE_ROOT);
        String cwdName = cwd.getFileName() != null ? cwd.getFileName().toString() : "";
        boolean runningFromModuleRoot = "forumBE".equalsIgnoreCase(cwdName);

        if (runningFromModuleRoot) {
            return direct;
        }
        if (Files.exists(workspaceRootStyle)) {
            return workspaceRootStyle;
        }
        return direct;
    }

    private void loadPostsFromFile() {
        try {
            File file = jsonFilePath.toFile();
            if (file.exists()) {
                List<Post> loadedPosts = objectMapper.readValue(file, new TypeReference<List<Post>>() {});
                posts.addAll(loadedPosts);
                
                long maxId = posts.stream()
                        .mapToLong(Post::getId)
                        .max()
                        .orElse(0L);
                idCounter.set(maxId + 1);
            }
        } catch (IOException e) {
            System.err.println("Error loading posts from file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void savePostsToFile() {
        try {
            File file = jsonFilePath.toFile();
            File parent = file.getParentFile();
            if (parent != null) {
                parent.mkdirs();
            }
            objectMapper.writeValue(file, posts);
        } catch (IOException e) {
            System.err.println("Error saving posts to file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> reversedPosts = new ArrayList<>(posts);
        reversedPosts.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
        return ResponseEntity.ok(reversedPosts);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return posts.stream()
                .filter(post -> post.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestBody PostRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getText() == null || request.getText().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate category
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            if (!categoryService.isValidCategory(request.getCategory())) {
                return ResponseEntity.badRequest().build();
            }
        }

        Post newPost = new Post(
                idCounter.getAndIncrement(),
                request.getTitle(),
                request.getText(),
            request.getAuthor(),
            request.getReplyToId(),
            request.getCategory(),
                LocalDateTime.now()
        );
        posts.add(newPost);
        savePostsToFile();
        return ResponseEntity.status(HttpStatus.CREATED).body(newPost);
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody PostRequest request, @RequestHeader("Authorization") String token) {
        // Validate token
        if (!userService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid or expired token"));
        }
        
        String currentUsername = userService.getUsernameFromToken(token);
        if (currentUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid token"));
        }
        
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getText() == null || request.getText().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate category
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            if (!categoryService.isValidCategory(request.getCategory())) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        for (Post post : posts) {
            if (post.getId().equals(id)) {
                // Check if the current user is the author of the post
                if (!currentUsername.equals(post.getAuthor())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(createErrorResponse("You can only edit your own posts"));
                }
                
                post.setTitle(request.getTitle());
                post.setText(request.getText());
                post.setCategory(request.getCategory());
                savePostsToFile();
                return ResponseEntity.ok(post);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        // Validate token
        if (!userService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid or expired token"));
        }
        
        String currentUsername = userService.getUsernameFromToken(token);
        if (currentUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid token"));
        }
        
        // Find the post and check ownership
        Post postToDelete = posts.stream()
                .filter(post -> post.getId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (postToDelete == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Check if the current user is the author of the post
        if (!currentUsername.equals(postToDelete.getAuthor())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("You can only delete your own posts"));
        }
        
        posts.remove(postToDelete);
        savePostsToFile();
        return ResponseEntity.noContent().build();
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("errorMessage", message);
        return error;
    }

    static class Post {
        private Long id;
        private String title;
        private String text;
        private String author;
        private Long replyToId;
        private String category;
        private LocalDateTime createdAt;

        public Post() {}

        public Post(Long id, String title, String text, String author, Long replyToId, String category, LocalDateTime createdAt) {
            this.id = id;
            this.title = title;
            this.text = text;
            this.author = author;
            this.replyToId = replyToId;
            this.category = category;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public Long getReplyToId() { return replyToId; }
        public void setReplyToId(Long replyToId) { this.replyToId = replyToId; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    static class PostRequest {
        private String title;
        private String text;
        private String author;
        private Long replyToId;
        private String category;

        public PostRequest() {}

        public PostRequest(String title, String text, String author, Long replyToId, String category) {
            this.title = title;
            this.text = text;
            this.author = author;
            this.replyToId = replyToId;
            this.category = category;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public Long getReplyToId() { return replyToId; }
        public void setReplyToId(Long replyToId) { this.replyToId = replyToId; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
