# CivicPulse 🏛️

A full-stack **civic complaint management platform** built with Spring Boot + React.  
Citizens file issues, admins assign them to field workers, workers resolve them — with live status tracking across all three dashboards.

---

## 🔁 How It Works

```
1. Citizen submits a complaint  →  status: OPEN
2. Admin reviews in "Records Explorer"
3. Admin assigns to a Worker   →  status: IN_PROGRESS
4. Worker resolves it          →  status: RESOLVED
5. Citizen sees update + audit history
```

---

## 🛠️ Tech Stack

| Layer     | Technology                               |
|-----------|------------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS              |
| Backend   | Spring Boot 3.2, Spring Security 6, JWT  |
| Database  | MySQL 8+                                 |
| Auth      | JWT (stateless Bearer tokens)            |
| Build     | Maven (backend), npm (frontend)          |

---

## 📁 Project Structure

```
civicpulse/
├── .gitignore
├── README.md
│
├── backend/                         ← Spring Boot REST API
│   ├── pom.xml
│   └── src/main/java/com/civicpulse/
│       ├── config/
│       │   ├── DataSeeder.java      ← Seeds demo users & departments on startup
│       │   └── WebConfig.java       ← CORS + file upload config
│       ├── controller/
│       │   ├── AuthController.java       ← /api/auth/**
│       │   ├── ComplaintController.java  ← /api/complaints/**
│       │   ├── AdminController.java      ← /api/admin/**
│       │   ├── FeedbackController.java   ← /api/feedback/**
│       │   └── NotificationController.java
│       ├── model/                   ← JPA entities (maps to DB tables)
│       │   ├── User.java
│       │   ├── Complaint.java
│       │   ├── ComplaintLog.java    ← Audit trail
│       │   ├── Department.java
│       │   ├── Notification.java
│       │   └── Feedback.java
│       ├── repository/              ← Spring Data JPA interfaces
│       ├── scheduler/
│       │   └── EscalationEngine.java ← Auto-escalates stale complaints
│       ├── security/
│       │   ├── WebSecurityConfig.java  ← Security rules + CORS
│       │   ├── JwtUtils.java           ← Token generation/validation
│       │   └── AuthTokenFilter.java    ← JWT interceptor on all requests
│       └── service/
│           └── FileStorageService.java ← Image uploads
│
└── frontend/                        ← React + Vite SPA
    └── src/
        ├── App.jsx                  ← Routes
        ├── context/AuthContext.jsx  ← Global auth state (JWT + user)
        ├── services/api.js          ← Axios client (auto-attaches JWT)
        ├── components/
        │   ├── DashboardLayout.jsx  ← Sidebar + header
        │   └── ProtectedRoute.jsx   ← Role-based route guard
        └── pages/
            ├── Login.jsx            ← Citizen login
            ├── StaffLogin.jsx       ← Admin / Worker login
            ├── Register.jsx         ← New citizen registration
            ├── CitizenDashboard.jsx ← Submit complaints + quick view
            ├── CitizenReports.jsx   ← Full "My Reports" page + history
            ├── AdminDashboard.jsx   ← Analytics charts
            ├── AdminReports.jsx     ← Assign workers to complaints
            ├── UserManagement.jsx   ← View all users
            ├── WorkerDashboard.jsx  ← Assigned tasks + resolve button
            └── CityMap.jsx          ← Geo-location heatmap
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**  
- **MySQL 8+** running locally (XAMPP, MySQL Workbench, or standalone)

---

### 1. Backend Setup

```bash
cd backend
```

Copy the example config and fill in your values:

**Windows:**
```bash
copy src\main\resources\application.properties.example src\main\resources\application.properties
```

**Mac/Linux:**
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Edit `application.properties` with your MySQL credentials:
```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Start the backend:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run

# Backend starts on → http://localhost:8081
```

> The database `civicpulse_v2_db` is created automatically on first run.  
> Demo users and departments are seeded automatically at startup.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Frontend starts on → http://localhost:5174
```

Open your browser at **http://localhost:5174**


---

## 👤 Default Seeded Accounts

| Role    | Email                     | Password   | Login Page   |
|---------|---------------------------|------------|--------------|
| Admin   | admin@civicpulse.com      | admin123   | Staff Login  |
| Worker  | worker@civicpulse.com     | worker123  | Staff Login  |
| Citizen | bob@citizen.com           | bob123     | Citizen Login|

- **Citizens** can self-register from the home page
- **Workers** must be registered via the API (see below) — they cannot self-register

**Register a new worker via API:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Worker Name","email":"worker@city.gov","password":"pass123","role":"WORKER"}'
```

---

## 🔑 API Endpoints

### Auth
| Method | Path                  | Auth    | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | `/api/auth/register`  | Public  | Register a new user      |
| POST   | `/api/auth/login`     | Public  | Login → returns JWT token|

### Complaints
| Method | Path                                     | Auth          | Description                  |
|--------|------------------------------------------|---------------|------------------------------|
| POST   | `/api/complaints`                        | Citizen       | Submit a new complaint       |
| GET    | `/api/complaints/my`                     | Citizen       | Get my own complaints        |
| GET    | `/api/complaints`                        | Admin, Worker | Get all complaints           |
| GET    | `/api/complaints/worker`                 | Worker        | Get my assigned complaints   |
| PUT    | `/api/complaints/{id}/assign/{workerId}` | Admin         | Assign a worker              |
| PUT    | `/api/complaints/{id}/status`            | Worker, Admin | Update status / resolve      |
| GET    | `/api/complaints/{id}/logs`              | Any           | Get full audit trail         |

### Admin
| Method | Path                   | Auth  | Description             |
|--------|------------------------|-------|-------------------------|
| GET    | `/api/admin/analytics` | Admin | Stats for dashboard     |
| GET    | `/api/admin/users`     | Admin | List all users          |

### Notifications
| Method | Path                      | Auth | Description                  |
|--------|---------------------------|------|------------------------------|
| GET    | `/api/notifications`      | Any  | Get unread notifications     |
| PUT    | `/api/notifications/{id}` | Any  | Mark notification as read    |

### Feedback
| Method | Path                         | Auth    | Description          |
|--------|------------------------------|---------|----------------------|
| POST   | `/api/feedback/{complaintId}`| Citizen | Submit rating        |
| GET    | `/api/feedback/{complaintId}`| Citizen | Check feedback given |

---

## ⚙️ Configuration Reference

| Property                     | Default                  | Description                         |
|------------------------------|--------------------------|-------------------------------------|
| `server.port`                | `8081`                   | Backend port                        |
| `spring.datasource.url`      | `jdbc:mysql://...`       | MySQL connection string             |
| `spring.datasource.username` | `${DB_USERNAME:root}`    | DB user (env var or default)        |
| `spring.datasource.password` | `${DB_PASSWORD:changeme}`| DB pass (env var or default)        |
| `jwt.secret`                 | 256-bit hex key          | Change this in production!          |
| `jwt.expirationMs`           | `86400000`               | Token lifetime (24 hours)           |
| `escalation.cron`            | `*/30 * * * * *`         | How often to check stale complaints |
| `escalation.thresholdDays`   | `3`                      | Days before a complaint escalates   |

> For production: set `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` as environment variables. Change `escalation.cron` to a daily schedule like `0 0 8 * * *`.

---

## � Roles & Permissions

| Feature                        | Citizen | Worker | Admin |
|--------------------------------|:-------:|:------:|:-----:|
| Submit complaint               | ✅       |        |       |
| View own complaints            | ✅       |        |       |
| View all complaints            |         | ✅      | ✅     |
| View assigned tasks            |         | ✅      |       |
| Assign worker to complaint     |         |        | ✅     |
| Mark complaint as resolved     |         | ✅      | ✅     |
| View analytics dashboard       |         |        | ✅     |
| Manage users                   |         |        | ✅     |

---

## 🤖 Auto-Escalation

The `EscalationEngine` runs every 30 seconds (configurable).  
It finds complaints that have been sitting in `OPEN` or `IN_PROGRESS` for more than `escalationThresholdDays` and automatically bumps their priority:

```
LOW → MEDIUM → HIGH → CRITICAL
```

---

## 📝 Notes

- **Never commit real credentials** — use environment variables (`DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`) or set them as local defaults in `application.properties` without committing.
- The database is created automatically on first run (`createDatabaseIfNotExist=true`).
- `spring.jpa.hibernate.ddl-auto=update` auto-creates/modifies tables from entity classes — safe for development, use `validate` for production.
- Demo data (departments + users) is seeded by `DataSeeder.java` on every startup (only creates if not already present).
