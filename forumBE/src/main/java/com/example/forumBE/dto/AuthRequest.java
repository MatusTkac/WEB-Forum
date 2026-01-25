package com.example.forumBE.dto;

public class AuthRequest {
    private String name;
    private String password;

    public AuthRequest() {}

    public AuthRequest(String name, String password) {
        this.name = name;
        this.password = password;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
