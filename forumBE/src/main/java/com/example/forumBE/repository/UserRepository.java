package com.example.forumBE.repository;

import com.example.forumBE.entity.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class UserRepository {
    private static final String JSON_FILE_PATH = "src/main/resources/users.json";
    private static final String JSON_FILE_PATH_FROM_WORKSPACE_ROOT = "forumBE/src/main/resources/users.json";
    
    private final ObjectMapper objectMapper;
    private final List<User> users = new ArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);
    private final Path jsonFilePath;

    public UserRepository() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        
        this.jsonFilePath = resolveJsonFilePath();
        loadUsersFromFile();
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

    private void loadUsersFromFile() {
        try {
            File file = jsonFilePath.toFile();
            if (file.exists()) {
                List<User> loadedUsers = objectMapper.readValue(file, new TypeReference<List<User>>() {});
                users.addAll(loadedUsers);
                
                long maxId = users.stream()
                        .mapToLong(User::getId)
                        .max()
                        .orElse(0L);
                idCounter.set(maxId + 1);
            } else {
                // Initialize with default users if file doesn't exist
                initializeDefaultUsers();
            }
        } catch (IOException e) {
            System.err.println("Error loading users from file: " + e.getMessage());
            e.printStackTrace();
            // Initialize with default users if loading fails
            initializeDefaultUsers();
        }
    }

    private void initializeDefaultUsers() {
        User user1 = new User();
        user1.setId(idCounter.getAndIncrement());
        user1.setName("JankoService");
        user1.setEmail("janko@jano.sk");
        user1.setPassword("password123");
        user1.setActive(true);
        
        User user2 = new User();
        user2.setId(idCounter.getAndIncrement());
        user2.setName("MarienkaService");
        user2.setEmail("maria@jano.sk");
        user2.setPassword("mojeTajneHeslo");
        user2.setActive(true);
        
        users.add(user1);
        users.add(user2);
        
        saveUsersToFile();
    }

    private synchronized void saveUsersToFile() {
        try {
            File file = jsonFilePath.toFile();
            File parent = file.getParentFile();
            if (parent != null) {
                parent.mkdirs();
            }
            objectMapper.writeValue(file, users);
        } catch (IOException e) {
            System.err.println("Error saving users to file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public List<User> findAll() {
        return new ArrayList<>(users);
    }

    public Optional<User> findById(Long id) {
        return users.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst();
    }

    public Optional<User> findByName(String name) {
        return users.stream()
                .filter(user -> user.getName().equals(name))
                .findFirst();
    }

    public Optional<User> findByEmail(String email) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }

    public User save(User user) {
        if (user.getId() == null) {
            user.setId(idCounter.getAndIncrement());
            users.add(user);
        } else {
            // Update existing user
            users.removeIf(u -> u.getId().equals(user.getId()));
            users.add(user);
        }
        saveUsersToFile();
        return user;
    }

    public boolean deleteById(Long id) {
        boolean removed = users.removeIf(user -> user.getId().equals(id));
        if (removed) {
            saveUsersToFile();
        }
        return removed;
    }

    public boolean existsByName(String name) {
        return users.stream().anyMatch(user -> user.getName().equals(name));
    }

    public boolean existsByEmail(String email) {
        return users.stream().anyMatch(user -> user.getEmail().equals(email));
    }
}
