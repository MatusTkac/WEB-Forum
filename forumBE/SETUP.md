# Backend Setup

## Prerequisites
- **Java 21** - Download from https://www.oracle.com/java/technologies/downloads/#jdk21-windows (choose JDK 21, Windows x64 installer)

## Installation
1. Install Java 21 and ensure `JAVA_HOME` is set (installer usually does this)
2. Verify Java installation:
   ```cmd
   java -version
   ```

## Running the Backend
Navigate to the `forumBE` folder and run:
```cmd
mvnw.cmd spring-boot:run
```

The Maven wrapper (`mvnw.cmd`) handles Maven installation automatically - no separate Maven installation needed.

Server will start on http://localhost:8080 (check console output for the actual port).
