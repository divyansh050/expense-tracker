# 💼 Expense Tracker App

A full-stack Expense Management system with user authentication, role-based access (admin and users), approval/rejection pipeline, and admin analytics.

---

## 🧰 Tech Stack

### 📦 Backend

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** Authentication
- **Role-Based Authorization**

### 🎨 Frontend

- **React** + **Redux Toolkit**
- **Vite** + **Tailwind CSS**
- **Axios**

---

## 📁 Project Structure

```
project-root/
├── backend/src         # Express + TypeScript backend
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   └── ...
└── frontend/src        # React + Vite + Redux frontend
    ├── components/
    ├── pages/
    └── ...
```

---

## 🔐 Authentication & Authorization

### 👤 User Model

- Each user has:
  - `name`, `email`, `password`
  - `role`: either `"admin"` or `"employee"`

### 🔒 Login/Signup

| Endpoint                 | Description         |
| ------------------------ | ------------------- |
| `POST /api/users/signup` | Register new user   |
| `POST /api/users/login`  | Login existing user |

- Returns a JWT on login
- Frontend stores and sends JWT in `Authorization: Bearer <token>` headers

---

## 💰 Expense Routes

All routes under `/api/expenses` require authentication.

| Method | Endpoint            | Access     | Description                                |
| ------ | ------------------- | ---------- | ------------------------------------------ |
| POST   | `/api/expenses`     | Auth Users | Create a new expense                       |
| GET    | `/api/expenses`     | Auth Users | Get current user's expenses                |
| PUT    | `/api/expenses/:id` | Auth Users | Update user’s expense or update its status |
| DELETE | `/api/expenses/:id` | Auth Users | Delete user’s expense                      |
| GET    | `/api/expenses/all` | Admin Only | Get all users’ expenses                    |

### ✅ Approval / Rejection Logic

- **Single endpoint:** `PUT /api/expenses/:id`
- In request body, provide:
  ```json
  {
    "status": "approved" // or "rejected"
  }
  ```
- Only **admins** can change the status field.

---

## 📊 Admin Analytics

| Method | Endpoint                                        | Description                    |
| ------ | ----------------------------------------------- | ------------------------------ |
| GET    | `/api/expenses/admin/analytics/category-totals` | Get totals grouped by category |
| GET    | `/api/expenses/admin/analytics/users`           | Get totals grouped by users    |

These are protected admin-only routes.

---

## 🖥️ Frontend Features

- User login & logout
- Add/Edit/Delete personal expenses
- Filter expenses by category, status, search term
- Admin:
  - View all expenses
  - Approve/Reject expenses
  - View analytics dashboard

---

## 🔧 Setup Instructions

### Backend

1. Navigate to backend folder:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/expensesdb
   JWT_SECRET=your_jwt_secret
   ```

3. Run in development:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

### Frontend

1. Navigate to frontend folder:

   ```bash
   cd frontend
   npm install
   ```

2. Update base url in `src/api/axios` file

3. Run in development:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🚀 Features Summary

- 👥 Role-based access (employee/admin)
- 🔐 Secure JWT authentication
- 🧾 Personal and global expense management
- ✅ Approval/rejection pipeline (admin)
- 📊 Analytics by category and user
- ⚡ Fast frontend (Vite + Tailwind + Redux Toolkit)

---
