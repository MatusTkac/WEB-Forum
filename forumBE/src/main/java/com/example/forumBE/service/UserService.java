package com.example.forumBE.service;

import com.example.forumBE.dto.AuthRequest;
import com.example.forumBE.dto.AuthResponse;
import com.example.forumBE.dto.UserRequest;
import com.example.forumBE.entity.User;
import com.example.forumBE.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final Map<String, String> tokenStore = new ConcurrentHashMap<>(); // token -> username
    private final Map<String, LocalDateTime> tokenExpiry = new ConcurrentHashMap<>(); // token -> expiry time

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getAllUsersWithToken(String token) {
        if (!isValidToken(token)) {
            throw new SecurityException("Invalid or expired token");
        }
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id, String token) {
        if (!isValidToken(token)) {
            throw new SecurityException("Invalid or expired token");
        }
        return userRepository.findById(id);
    }

    public AuthResponse login(AuthRequest authRequest) {
        Optional<User> userOpt = userRepository.findByName(authRequest.getName());
        
        if (userOpt.isEmpty()) {
            return new AuthResponse(false);
        }
        
        User user = userOpt.get();
        
        // Verify password exists and matches
        if (user.getPassword() == null || !user.getPassword().equals(authRequest.getPassword())) {
            return new AuthResponse(false);
        }
        
        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        // Generate token
        String token = generateToken();
        tokenStore.put(token, user.getName());
        tokenExpiry.put(token, LocalDateTime.now().plusHours(24)); // Token valid for 24 hours
        
        return new AuthResponse(token, user.getName(), true);
    }

    public boolean logout(String token) {
        if (token != null) {
            tokenStore.remove(token);
            tokenExpiry.remove(token);
        }
        return true;
    }

    public User register(UserRequest userRequest) {
        // Check if user already exists
        if (userRepository.existsByName(userRequest.getName())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Create new user
        User newUser = new User();
        newUser.setName(userRequest.getName());
        newUser.setEmail(userRequest.getEmail());
        newUser.setPassword(userRequest.getPassword());
        newUser.setActive(true);
        
        return userRepository.save(newUser);
    }

    public List<String> checkUserConflicts(UserRequest userRequest) {
        List<String> conflicts = new ArrayList<>();
        
        if (userRepository.existsByName(userRequest.getName())) {
            conflicts.add("Username already exists");
        }
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            conflicts.add("Email already exists");
        }
        
        return conflicts;
    }

    public boolean deleteUser(Long id, String token) {
        if (!isValidToken(token)) {
            throw new SecurityException("Invalid or expired token");
        }
        return userRepository.deleteById(id);
    }

    public boolean isValidToken(String token) {
        if (token == null || !tokenStore.containsKey(token)) {
            return false;
        }
        
        LocalDateTime expiry = tokenExpiry.get(token);
        if (expiry == null || expiry.isBefore(LocalDateTime.now())) {
            // Token expired, remove it
            tokenStore.remove(token);
            tokenExpiry.remove(token);
            return false;
        }
        
        return true;
    }

    public String getUsernameFromToken(String token) {
        return tokenStore.get(token);
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }

    // Clean up expired tokens periodically
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenExpiry.entrySet().removeIf(entry -> {
            if (entry.getValue().isBefore(now)) {
                tokenStore.remove(entry.getKey());
                return true;
            }
            return false;
        });
    }
}
