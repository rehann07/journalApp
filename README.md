# 📔 Journal App – Full-Stack Monorepo

<div align="center">

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Spring Boot](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

> **A modern, intelligent personal journaling platform.** > This repository contains the complete full-stack codebase, featuring a lightning-fast **React 19 / Vite** UI and a scalable, event-driven **Spring Boot** backend powered by **Groq AI** and **Apache Kafka**.

---

## 🌍 Live Environments

The application is fully deployed and accessible online:

* 🚀 **Frontend (Vercel):** [https://journal-app-ten-gilt.vercel.app](https://journal-app-ten-gilt.vercel.app)
* ⚙️ **Backend API (Render - Swagger UI):** [https://journal-app-api-8pi1.onrender.com/journal/swagger-ui/index.html](https://journal-app-api-8pi1.onrender.com/journal/swagger-ui/index.html)

---

## 📖 Documentation Directory

This project is structured as a monorepo. Detailed setup instructions, environment configurations, and deep dives into the architecture can be found in their respective directories:

* 🎨 [**Frontend Documentation (`/journal-app-frontend`)**](./journal-app-frontend/README.md)
  * Covers React context, Vite setup, Tailwind v4 styling, and Axios interceptors.
* ⚙️ [**Backend Documentation (`/journal-app-backend`)**](./journal-app-backend/README.md)
  * Covers Spring Boot architecture, MongoDB transactions, Spring AI / Groq integration, Dockerization, and Kafka event streaming.

---

## 🏗 High-Level Cloud Architecture

The platform operates on a decoupled, cloud-native architecture ensuring high performance and security:

1. **Client Layer:** A React 19 SPA running on **Vite**, utilizing Tailwind CSS for a fully responsive UI, deployed globally via **Vercel's** edge network.
2. **Gateway & Security:** REST APIs secured via Hybrid Authentication (Google OAuth2 & standard BCrypt/JWT). 
3. **Core Services:** A Dockerized **Spring Boot 3.x** backend hosted on **Render**, handling business logic, user management, and persistence to a managed **MongoDB Atlas** cluster.
4. **AI & Event Streaming:** Asynchronous processing using an **Aiven Apache Kafka** cluster to distribute LLM-generated (Llama 3.1 via **Groq**) weekly emotional synthesis reports.

---

## 🚀 Quick Start (Local Development)

To run the full stack locally, you will need two terminal windows. Ensure you have **Java 21**, **Node.js (v18+)**, **MongoDB**, and **Kafka** installed and running.

### 1. Start the Backend
Navigate to the backend directory, configure your `.env` variables (as specified in the backend README), and run the Spring Boot server:
```bash
cd journal-app-backend
./mvnw spring-boot:run
```

*The API will start on `http://localhost:8080/journal*`

### 2. Start the Frontend

Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite development server:

```bash
cd journal-app-frontend
npm install
npm run dev
```

*The UI will be accessible at `http://localhost:5173*`

---

## 🛠 Complete Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, Axios

**Backend:** Java 21, Spring Boot 3.3.x, Spring Security, Spring AI, Docker

**Database:** MongoDB Atlas (Cloud NoSQL with Transaction Management)

**Event Streaming:** Aiven Apache Kafka (SASL_SSL / SCRAM-SHA-256)

**Artificial Intelligence:** Groq API (Llama 3.1)

**Authentication:** JWT (JSON Web Tokens), Google OAuth2

**Cloud Hosting:** Vercel (Frontend), Render (Backend)

---

## 👤 Author

**Rehan Naikwadi**

GitHub: [@rehann07](https://github.com/rehann07)

---

## 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](./LICENSE) file for full details.
