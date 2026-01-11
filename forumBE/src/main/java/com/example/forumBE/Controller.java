package com.example.forumBE;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class Controller {

    private static final String JSON_FILE_PATH = "src/main/resources/posts.json";
    private static final String JSON_FILE_PATH_FROM_WORKSPACE_ROOT = "forumBE/src/main/resources/posts.json";
    private final ObjectMapper objectMapper;
    private final List<Post> posts = new ArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);
    private final Path jsonFilePath;

    public Controller() {
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

        Post newPost = new Post(
                idCounter.getAndIncrement(),
                request.getTitle(),
                request.getText(),
            request.getAuthor(),
            request.getReplyToId(),
                LocalDateTime.now()
        );
        posts.add(newPost);
        savePostsToFile();
        return ResponseEntity.status(HttpStatus.CREATED).body(newPost);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        boolean removed = posts.removeIf(post -> post.getId().equals(id));
        if (removed) {
            savePostsToFile(); // Save to JSON file
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class Post {
        private Long id;
        private String title;
        private String text;
        private String author;
        private Long replyToId;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class PostRequest {
        private String title;
        private String text;
        private String author;
        private Long replyToId;
    }
}
