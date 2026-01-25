package com.example.forumBE.controller;

import com.example.forumBE.dto.AuthRequest;
import com.example.forumBE.dto.AuthResponse;
import com.example.forumBE.dto.UserRequest;
import com.example.forumBE.entity.User;
import com.example.forumBE.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{token}")
    public ResponseEntity<?> getAllUsersWithToken(@PathVariable String token) {
        try {
            List<User> users = userService.getAllUsersWithToken(token);
            return ResponseEntity.ok(users);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/user/{id}/{token}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, @PathVariable String token) {
        try {
            Optional<User> user = userService.getUserById(id, token);
            return user.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        if (authRequest.getName() == null || authRequest.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Username is required"));
        }
        if (authRequest.getPassword() == null || authRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Password is required"));
        }

        AuthResponse response = userService.login(authRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid username or password"));
        }
    }

    @GetMapping("/logout/{token}")
    public ResponseEntity<?> logout(@PathVariable String token) {
        userService.logout(token);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRequest userRequest) {
        // Validate input
        if (userRequest.getName() == null || userRequest.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Username is required"));
        }
        if (userRequest.getEmail() == null || userRequest.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Email is required"));
        }
        if (userRequest.getPassword() == null || userRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Password is required"));
        }

        try {
            User newUser = userService.register(userRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/user-conflicts")
    public ResponseEntity<List<String>> checkUserConflicts(@RequestBody UserRequest userRequest) {
        List<String> conflicts = userService.checkUserConflicts(userRequest);
        return ResponseEntity.ok(conflicts);
    }

    @DeleteMapping("/user/{id}/{token}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @PathVariable String token) {
        try {
            boolean deleted = userService.deleteUser(id, token);
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "User deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("errorMessage", message);
        return error;
    }
}
