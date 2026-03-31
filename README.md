# 🌊 HabitFlow — Modern Habit Tracking

[![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Platform](https://img.shields.io/badge/Platform-Web-brightgreen)](#)

A sleek, high-performance frontend for **HabitFlow**, built with **React**, **Vite**, and **Framer Motion**. Track your daily habits, visualize streaks with dynamic flame animations, and manage your progress through a stunning glassmorphism-inspired interface.

---

## ✨ Core Features

- **🚀 Authentication System**: Secure registration and login with session persistence using `localStorage` and cookie-based auth.
- **🔥 Dynamic Analytics**: Real-time streak tracking with multi-stage animated flame icons (Level 1 to Level 10).
- **🎨 Custom Styling**: Personalized habit themes with custom color picking and persistent UI states.
- **📸 Visual Validation**: Support for daily habit logs with image proof and title tracking.
- **🛡️ Admin Suite**: Comprehensive user moderation tools including banning, role management, and data export.
- **🎭 Premium UI/UX**: Smooth page transitions, toast notifications, and a responsive dark-mode first design.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **State Management** | [React Context API](https://react.dev/reference/react/useContext) |
| **Styling** | Vanilla CSS (Glassmorphism & Variables) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |

---

## 📁 Folder Structure

```text
src/
├── api/
│   └── axios.js            # Axios configuration & global interceptors
├── components/
│   ├── Footer.jsx          # Shared application footer
│   └── Navbar.jsx          # Context-aware navigation component
├── context/
│   └── AuthContext.jsx     # Auth state, login/logout, & session management
├── pages/
│   ├── AdminDashboard.jsx  # Admin-only user management interface
│   ├── Dashboard.jsx       # Main user portal & habit overview
│   ├── HabitDetail.jsx     # Detailed habit logs & history visualization
│   ├── Landing.jsx         # Public landing page with CTA
│   ├── Login.jsx           # User authentication form
│   └── Register.jsx        # New account registration form
├── App.jsx                 # Centralized routing & protective guards
├── App.css                 # Global styles for the application
├── index.css               # Global design system & theme variables
└── main.jsx                # Application root & provider bootstrap
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Clone and Install
```bash
# Clone the repository (if applicable)
git clone <repository-url>
cd habit-tracker-frontend

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173` by default.

---

## 🧠 Architectural Overview

### 🔐 Authentication Flow
The application uses a centralized `AuthContext` to manage user state. It handles:
- Persistence of user data across page refreshes via `localStorage`.
- Automatic redirection for protected routes (`/dashboard`, `/habit/:id`, `/admin`).
- Handling `401 Unauthorized` responses to automatically log out expired sessions.

### 📡 API Communication
Unified communication through a configured Axios instance in `src/api/axios.js`.
- Intercepts requests to include `withCredentials: true`.
- Global error handling for network failures or authentication issues.

---

## 📜 Available Scripts

- `npm run dev`: Start the Vite development server.
- `npm run build`: Build the production-ready bundle.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Run ESLint to check for code quality issues.

---

## 📞 Support & Community

If you encounter any issues or have feature requests, please open an issue in the repository.

**Made with ❤️ for a better routine.**
