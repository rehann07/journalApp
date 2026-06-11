# 📖 Journal App – Frontend 

> **A modern, lightning-fast UI for the Journal App platform.** > Built with **React 19, Vite, and Tailwind CSS v4**.
> Features **Dynamic Dark Mode**, **JWT Interceptors**, and **Google OAuth Integration**.

---

## 📑 Table of Contents

1. [Key Features](https://www.google.com/search?q=%23-key-features)
2. [Tech Stack](https://www.google.com/search?q=%23-tech-stack)
3. [Project Structure](https://www.google.com/search?q=%23-project-structure)
4. [Environment Variables](https://www.google.com/search?q=%23-environment-variables)
5. [Local Development Setup](https://www.google.com/search?q=%23-local-development-setup)
6. [Deployment](https://www.google.com/search?q=%23-deployment)

---

## 🚀 Key Features

### 🎨 UI & UX

* **Dynamic Dark Mode:** System-aware light/dark theme toggling utilizing Tailwind's `class` strategy.
* **Custom Toast System:** A lightweight, dependency-free notification hook (`useToast`) for beautiful, non-blocking alerts.
* **Responsive Typography:** Elegant typography pairings using **DM Serif Display** for headings and **DM Sans** for body copy.
* **Responsive Design:** Mobile-first layout with hidden hamburger menus and seamless desktop expansion.

### 🔐 Auth & Security

* **JWT Interceptors:** Global Axios configurations automatically attach the Bearer token to requests and gracefully force logouts on `401 Unauthorized` responses.
* **Protected Routing:** Dedicated React Router wrappers (`<ProtectedRoute />`, `<AdminRoute />`) prevent unauthorized access and handle post-login redirects.
* **OAuth2 Flow:** A dedicated callback page (`/auth/callback`) to parse and handle tokens issued by Google's authentication servers.

### 🧠 Data & Integrations

* **Live AI Sentiment Badges:** Visually renders the AI-generated emotional tags (Happy, Sad, Angry, Anxious) right on the journal dashboard.
* **User Control:** A transparent Profile settings page allowing users to completely manage their credentials and toggle AI tracking preferences.

---

## 🛠 Tech Stack

* **Framework:** React 19 (via Vite)
* **Styling:** Tailwind CSS v4 (using `@tailwindcss/vite`)
* **Routing:** React Router v7 (`react-router-dom`)
* **API Client:** Axios
* **State Management:** React Context API (`AuthContext`)

---

## 📂 Project Structure

```plaintext
journal-app-frontend/
├── public/                 # Static assets (Favicon)
├── src/
│   ├── api/                
│   │   └── axiosConfig.js  # Global Axios instance & JWT Interceptors
│   ├── components/         
│   │   ├── Navbar.jsx      # Sticky navigation & Dark Mode toggle
│   │   ├── ProtectedRoute  # Route guard for authenticated users
│   │   ├── AdminRoute.jsx  # Route guard for ROLE_ADMIN
│   │   └── ToastContainer  # UI wrapper for custom notifications
│   ├── context/
│   │   └── AuthContext.jsx # Global user state & JWT decoding
│   ├── hooks/
│   │   └── useToast.js     # Custom notification logic
│   ├── pages/              
│   │   ├── DashboardPage   # Main feed, search, and entry list
│   │   ├── EntryEditorPage # Create & Update journal entries
│   │   ├── ProfilePage     # User settings & AI preferences
│   │   ├── AdminPage       # System management & User table
│   │   ├── LoginPage       # Standard & Google authentication
│   │   └── GoogleCallback  # OAuth2 redirect handler
│   ├── App.jsx             # React Router layout definitions
│   ├── index.css           # Global CSS & Tailwind imports
│   └── main.jsx            # React root & theme initialization
├── index.html              # Entry HTML file
├── package.json            # Dependencies & scripts
└── vite.config.js          # Vite & Tailwind configuration

```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `/frontend` directory to connect your UI to the Spring Boot backend and Google OAuth.

```env
# 1. API Connection
# Point this to your backend. 
# IMPORTANT: If your Spring Boot server has a context-path, include it here!
VITE_API_BASE_URL=http://localhost:8080/journal

# 2. Google OAuth Integration
# Must match your backend and Google Cloud Console settings
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

```

---

## 💻 Local Development Setup

### 1. Install Dependencies

Make sure you have Node.js (v18+) installed. Run the following command from inside the `frontend` folder:

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The application will spin up at `http://localhost:5173`.

> **Note:** Ensure your Spring Boot backend is actively running to allow the frontend to authenticate and fetch data.

---

## 🚀 Deployment

This Vite application is fully optimized for static hosting platforms like **Vercel**, **Netlify**, or **Render**.

1. Connect your repository to Vercel/Netlify.
2. Ensure the Framework Preset is recognized as **Vite**.
3. Set your **Build Command** to `npm run build`.
4. Set your **Output Directory** to `dist`.
5. Add your `VITE_API_BASE_URL` (pointing to your live Render backend URL) in the hosting provider's Environment Variables settings.