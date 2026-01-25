package com.example.forumBE.dto;

public class AuthResponse {
    private String token;
    private String userName;
    private boolean success;

    public AuthResponse() {}

    public AuthResponse(String token, String userName, boolean success) {
        this.token = token;
        this.userName = userName;
        this.success = success;
    }

    public AuthResponse(boolean success) {
        this.success = success;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
}
