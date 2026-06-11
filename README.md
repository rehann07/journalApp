# 📔 Journal App – AI-Powered & Secure Backend

> **A scalable, event-driven backend for a modern personal journaling platform**, built with **Spring Boot**.
> Features **Hybrid Authentication (JWT & Google OAuth2)**, **LLM-powered sentiment analysis via Groq**,
> and **Apache Kafka** for asynchronous email reporting.

---

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

### 🔐 Advanced Security & Auth

* **Hybrid Authentication:** Supports both **Google OAuth2** login flows and standard **BCrypt** encrypted user credentials.
* **Stateless Architecture:** Fully stateless REST API using secure JSON Web Tokens (JWT) for session management.
* **Role-Based Access Control (RBAC):** Granular permissions for `USER` and `ADMIN` roles using Spring Security filters.
* **CORS Configured:** Production-ready Cross-Origin Resource Sharing configuration securely linking to modern frontend frameworks.

### 🧠 AI-Powered Insights (Groq & Spring AI)

* **Real-Time Sentiment Tagging:** Automatically analyzes the emotional tone of newly created journal entries (Happy, Sad, Angry, Anxious) using Llama 3.1.
* **Weekly AI Synthesis:** A scheduled Cron job compiles a user's weekly entries and generates a hyper-concise, empathetic mental health dashboard report.

### ⚡ Event-Driven Microservices

* **Apache Kafka Integration:** Decoupled producers and consumers handle the distribution of weekly AI sentiment reports asynchronously.
* **Cloud-Ready Security:** Configured for cloud Kafka providers (like Aiven) using `SASL_SSL` and `SCRAM-SHA-256`.
* **Transactional MongoDB:** Utilizes `MongoTransactionManager` to ensure database consistency during complex multi-document updates.

---

## 🏗 Architecture & Workflow

### 1. Standard Journal Flow

1. **User Action:** User creates a journal entry via the secured REST API.
2. **AI Analysis:** If the user has opted in, the backend sends the text to the **Groq LLM** via Spring AI for real-time sentiment classification.
3. **Persistence:** The entry, linked to the User document via `@DBRef`, is saved transactionally to **MongoDB**.

### 2. Scheduled Weekly Reporting Flow

1. **Cron Job triggers** every Sunday at 9:00 AM (`UserScheduler`).
2. **Data Aggregation:** Retrieves users opted into sentiment analysis and compiles their last 7 days of entries.
3. **AI Generation:** Sends the compiled text to Groq to generate a personalized mental health summary.
4. **Kafka Publishing:** The AI report is published to the `weekly-sentiments` Kafka topic.
5. **Email Delivery:** The `SentimentConsumerService` consumes the Kafka message and uses `JavaMailSender` to deliver the report to the user's inbox asynchronously.

---

## ⚙️ Configuration & Setup

### 1. Prerequisites

Ensure you have the following installed locally or running in the cloud:

* **Java 21 SDK** (or Java 17+)
* **MongoDB** (Local port `27017` or Atlas URL)
* **Apache Kafka** (Zookeeper + Broker, default port `9092`, or a cloud provider)

### 2. Environment Variables

Create a `.env` file or export these variables in your deployment environment (Render, AWS, Docker). The `application.yml` is already mapped to consume them dynamically:

```properties
# Server & Frontend Integration
SERVER_PORT=8080
FRONTEND_URL=http://localhost:5173

# Database Connections
MONGODB_URI=mongodb://localhost:27017

# Security Keys
JWT_SECRET=your_32_character_secure_random_string_here

# Authentication (Google OAuth2)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Configuration (Groq Llama 3.1)
GROQ_API_KEY=your_groq_api_key

# Kafka Configuration (SASL/SCRAM for Cloud)
KAFKA_SERVERS=your_kafka_bootstrap_server:9092
KAFKA_USERNAME=your_kafka_username 
KAFKA_API_SECRET=your_kafka_password 

# SMTP Email Configuration
JAVA_EMAIL=your_email@gmail.com
JAVA_EMAIL_PASSWORD=your_app_password

```

### 3. Run the Application

**Using Maven Wrapper:**

```bash
./mvnw spring-boot:run

```

---

## 📚 API Documentation

This project includes a fully interactive Swagger UI (OpenAPI 3.0) configured with JWT Bearer Auth support.

👉 **Access Swagger UI:** `http://localhost:8080/journal/swagger-ui/index.html` *(Note the `/journal` context path)*

## 📡 API Endpoints

Below is the complete list of REST endpoints categorized by module.

### 🔓 Public & OAuth Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/public/signup` | Register a new user with privacy preferences |
| POST | `/public/login` | Login and receive Bearer Token |
| GET | `/auth/google/callback` | Google OAuth2 Callback URL (Issues JWT) |
| GET | `/public/health-check` | Check API application status |

### 📝 Journal Endpoints (Requires JWT)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/journal` | Create a new journal entry & run AI sentiment |
| GET | `/journal` | Get all entries for the logged-in user |
| GET | `/journal/id/{myId}` | Get a specific entry by its ID |
| PUT | `/journal/id/{myId}` | Update a specific entry & re-run AI analysis |
| DELETE | `/journal/id/{myId}` | Delete a specific entry by its ID |

### 👤 User Profile Endpoints (Requires JWT)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/user` | Fetch personalized greeting |
| PUT | `/user` | Update username, password, or AI preferences |
| DELETE | `/user` | Permanently delete account & all entries |

### 🛠️ Admin Endpoints (Requires `ROLE_ADMIN`)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/all-users` | View all registered users |
| POST | `/admin/create-admin-user` | Register a new system administrator |

---

## 📂 Project Structure

```plaintext
.
├── src/
│   ├── main/
│   │   ├── java/com/rehan/journalApp/
│   │   │   ├── config/          # CORS, Security, Swagger configurations
│   │   │   ├── controller/      # REST API Controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # MongoDB Documents (User, JournalEntry)
│   │   │   ├── enums/           # Enumerations (Sentiment types)
│   │   │   ├── filter/          # Security Filters (JwtFilter)
│   │   │   ├── model/           # POJOs for internal messaging (SentimentData)
│   │   │   ├── repository/      # MongoDB Repositories & Custom Criteria Impl
│   │   │   ├── scheduler/       # Cron Jobs (UserScheduler for weekly emails)
│   │   │   ├── service/         # Business Logic (AI, Kafka, Auth, Journal)
│   │   │   ├── utils/           # Utility Classes (JwtUtil)
│   │   │   └── JournalApplication.java
│   │   └── resources/
│   │       ├── application.yml  # Main application properties & externalized config
│   │       ├── application-dev.yml  # Development Profile
│   │       └── application-prod.yml # Production Profile
│   │       └── ca.pem           # Kafka SSL truststore certificate
│   └── test/                    # Unit & Integration Tests
├── mvnw                     # Maven Wrapper Script
└── pom.xml                  # Project Dependencies & Build Config

```

---

## 🛠 Tech Stack

### Backend Framework

* Spring Boot 3.x
* Spring MVC
* Spring Data MongoDB
* Spring Security

### Authentication & Authorization

* JWT (JSON Web Tokens)
* Google OAuth2
* BCrypt Password Encoder
* Role-Based Access Control (RBAC)

### Database

* MongoDB
* MongoDB Transactions (`MongoTransactionManager`)

### Artificial Intelligence

* Spring AI
* Groq API
* Llama 3.1

### Messaging & Event Streaming

* Apache Kafka
* Kafka Producers & Consumers
* SASL_SSL Authentication
* SCRAM-SHA-256 Security

### API Documentation

* Swagger UI
* OpenAPI 3

### Email Services

* JavaMailSender
* SMTP

### Build & Dependency Management

* Maven
* Maven Wrapper (`mvnw`)

### Testing

* JUnit 5
* Spring Boot Test
* Mockito

### Deployment & Cloud Support

* Render
* MongoDB Atlas
* Aiven Kafka

### Development Tools

* IntelliJ IDEA / VS Code
* Postman
* Git & GitHub

### Programming Language

* Java 21


---

## 🧪 Testing

Run unit and integration tests using the Maven wrapper:

```bash
./mvnw test

```

---

## 👤 Author

**Rehan Naikwadi**

GitHub: [@rehann07](https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2Frehann07)

---

## 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](./LICENSE) file for full details.