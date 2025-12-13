# 📔 Journal App – Secure & Scalable Backend

<div align="center">

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

</div>

> **A scalable and secure backend for a personal journaling platform**, built using **Spring Boot**.  
> Features **JWT & OAuth2 authentication**, **sentiment analysis on journal entries**,  
> and **Redis caching** for high performance and scalability.


## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Architecture & Workflow](#-architecture--workflow)
3. [Configuration & Setup](#-configuration--setup)
4. [API Documentation](#-api-documentation)
5. [Project Structure](#-project-structure)
6. [Tech Stack](#-tech-stack)
7. [Testing](#-testing)

---

## 🚀 Key Features

### 🔐 Advanced Security
* **OAuth2 & JWT:** Hybrid authentication system supporting **Google Login** and standard **BCrypt** encrypted credentials.
* **Stateless Architecture:** Fully stateless REST API using JSON Web Tokens (JWT) for session management.
* **Role-Based Access Control (RBAC):** Granular permissions for `USER` and `ADMIN` roles using Spring Security filters.

### 🧠 Smart Microservices
* **Sentiment Analysis Pipeline:** Decoupled **Apache Kafka** producers and consumers analyze journal entries asynchronously to detect emotional tone (Positive/Negative).
* **Weather Integration:** Automatically calls external Weather APIs to tag journal entries with context-aware weather data.

### ⚡ High Performance
* **Redis Caching:** Implemented caching for user profiles and journal feeds to minimize MongoDB read operations.
* **Optimized Database:** MongoDB schema designed for high-throughput write operations.
* **Asynchronous Tasks:** `EmailService` and `SentimentService` run on background threads to ensure non-blocking API responses.

---

## 📐 Non-Functional Requirements

- **Scalability:** Kafka-based async processing for heavy workloads
- **Performance:** Redis caching with TTL to reduce DB load
- **Security:** Stateless JWT authentication with OAuth2
- **Reliability:** Idempotent consumers and retry-safe Kafka processing
- **Maintainability:** Layered architecture with DTO separation

---

## 🏗 Architecture & Workflow

1.  **User Action:** User posts a journal entry via REST API.
2.  **Persistence:** Data is saved to **MongoDB**.
3.  **Context Enrichment:** **Weather Service** fetches local weather data.
4.  **Async Processing:** The entry ID is pushed to a **Kafka Topic**.
5.  **Sentiment Analysis:** A Kafka Consumer picks up the message, analyzes the text, and updates the entry with a sentiment score.
6.  **Caching:** Frequently accessed data (User Profile) is cached in **Redis** with a TTL.

---

## ⚙️ Configuration & Setup

### 1. Prerequisites
Ensure you have the following installed locally or running in the cloud:
* **Java 21 SDK**
* **MongoDB** (Local port `27017` or Atlas URL)
* **Redis** (Local port `6379`)
* **Apache Kafka** (Zookeeper + Broker, default port `9092`)

### 2. Environment Variables
Create a `.env` file (or set these in `application.properties`) in the root directory:

```properties
# Server Configuration
SERVER_PORT=8080

# Database Connections
MONGODB_URI=mongodb://localhost:27017/journaldb
REDIS_HOST=localhost
REDIS_PASSWORD=

# Kafka Configuration
KAFKA_SERVERS=localhost:9092
KAFKA_USERNAME=your_username # Optional if local
KAFKA_PASSWORD=your_password # Optional if local

# Authentication (Google OAuth2)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# External Services
WEATHER_API_KEY=your_weather_api_key
JAVA_EMAIL=your_email@gmail.com
JAVA_EMAIL_PASSWORD=your_app_password
````

### 3\. Run the Application

**Using Maven Wrapper:**

```bash
./mvnw spring-boot:run
```

-----

## 📚 API Documentation

This project includes a fully interactive Swagger UI (OpenAPI 3.0).

👉 **Access UI:** `http://localhost:8080/swagger-ui/index.html`

## 📡 API Endpoints

Below is the complete list of API endpoints categorized by module.

---

### 🔓 Public / Auth

| Method | Endpoint                 | Description                           |
|--------|---------------------------|---------------------------------------|
| POST   | `/public/signup`          | Register a new user                   |
| POST   | `/public/login`           | Login and receive Bearer Token        |
| GET    | `/auth/google/callback`   | Google OAuth2 Callback URL            |
| GET    | `/public/health-check`    | Check API application status          |

---

### 📝 Journal Endpoints

| Method | Endpoint                    | Description                           |
|--------|------------------------------|---------------------------------------|
| POST   | `/journal`                   | Create a new journal entry            |
| GET    | `/journal`                   | Get all entries for logged-in user    |
| GET    | `/journal/id/{myId}`         | Get a specific entry by ID            |
| PUT    | `/journal/id/{myId}`         | Update a specific entry by ID         |
| DELETE | `/journal/id/{myId}`         | Delete a specific entry by ID         |

---

### 👤 User Endpoints

| Method | Endpoint | Description                  |
|--------|----------|------------------------------|
| GET    | `/user`  | Get current user profile     |
| PUT    | `/user`  | Update user credentials/info |
| DELETE | `/user`  | Delete current user account  |

---

### 🛠️ Admin Endpoints

| Method | Endpoint                       | Description                             |
|--------|----------------------------------|-----------------------------------------|
| GET    | `/admin/all-users`              | View all registered users               |
| POST   | `/admin/create-admin-user`      | Create a new administrator account      |
| GET    | `/admin/clear-app-cache`        | Clear application cache (Redis/Memory)  |

---

-----


## 📂 Project Structure

```plaintext
.
├── .github/workflows/    # CI/CD Pipeline (build.yml)
├── src/
│   ├── main/
│   │   ├── java/com/rehan/journalApp/
│   │   │   ├── api/response/    # External API Responses (WeatherResponse)
│   │   │   ├── cache/           # Application Level Cache (AppCache)
│   │   │   ├── config/          # Configuration (Security, Redis, Swagger)
│   │   │   ├── constants/       # Global Constants (PlaceHolders)
│   │   │   ├── controller/      # REST Controllers (Admin, Public, User, Journal)
│   │   │   ├── dto/             # Data Transfer Objects (UserDTO)
│   │   │   ├── entity/          # MongoDB Documents (User, JournalEntry)
│   │   │   ├── enums/           # Enumerations (Sentiment)
│   │   │   ├── filter/          # Security Filters (JwtFilter)
│   │   │   ├── model/           # POJOs (SentimentData)
│   │   │   ├── repository/      # Data Access Layer & Custom Impl
│   │   │   ├── scheduler/       # Cron Jobs (UserScheduler)
│   │   │   ├── service/         # Business Logic (Email, Sentiment, Redis, Weather)
│   │   │   ├── utils/           # Utility Classes (JwtUtil)
│   │   │   └── JournalApplication.java
│   │   └── resources/
│   │       ├── application.yml      # Main Configuration
│   │       ├── application-dev.yml  # Development Profile
│   │       └── application-prod.yml # Production Profile
│   └── test/                    # Unit & Integration Tests
├── mvnw                     # Maven Wrapper Script
└── pom.xml                  # Project Dependencies & Build Config
```

-----

## 🛠 Tech Stack
<table>
  <tr>
    <td align="center" width="90">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" height="40" alt="java logo" />
      <br><div style="font-size: 12px;">Java</div>
    </td>
    <td align="center" width="90">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" height="40" alt="spring logo" />
      <br><div style="font-size: 12px;">Spring</div>
    </td>
    <td align="center" width="90">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" height="40" alt="mongodb logo" />
      <br><div style="font-size: 12px;">MongoDB</div>
    </td>
    <td align="center" width="90">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" height="40" alt="redis logo" />
      <br><div style="font-size: 12px;">Redis</div>
    </td>
    <td align="center" width="90">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg" height="40" alt="kafka logo" />
      <br><div style="font-size: 12px;">Kafka</div>
    </td>
    <td align="center" width="90">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/maven/maven-original.svg" height="40" alt="maven logo" />
      <br><div style="font-size: 12px;">Maven</div>
    </td>
    <td align="center" width="90">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" height="40" alt="git logo" />
      <br><div style="font-size: 12px;">Git</div>
    </td>
  </tr>
</table>

-----

## 🧪 Testing

Run unit and integration tests using Maven:

```bash
./mvnw test
```

-----

## 👤 Author

**Rehan Naikwadi**

* GitHub: https://github.com/rehann07

-----

## 🤝 Contributing

Contributions are welcome! To contribute, please follow these steps:

1. **Fork** the repository
2. **Create your feature branch**
   ```sh
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```sh
   git commit -m "Add some AmazingFeature"
   ```
4. **Push to the branch**
   ```sh
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request** for review

## 📄 License

This project is licensed under the **MIT License**.  
See the [`LICENSE`](./LICENSE) file for full details.

