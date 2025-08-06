# 🏗️ MuntadaaCom — `manageSol` Database Design

This document describes the core database structure and logic implemented for the `manageSol` application.

---

## 📘 Overview

The `manageSol` module allows management of companies and their associated users. When a company is created, an initial admin user is auto-created and linked to it.

Key features:
- Unique IDs for all records via UUID.
- Auto-creation of a default admin user upon company registration.
- Use of SQL triggers to enforce automation and data integrity.

---

## 🗃️ Tables

### 1. `company`

| Field        | Type                               | Description                       |
|--------------|------------------------------------|-----------------------------------|
| `id`         | `VARCHAR(255)` (UUID)              | Primary key, generated via trigger|
| `title`      | `VARCHAR(255)`                     | Company name                      |
| `description`| `TEXT`                             | Optional company description      |
| `logo`       | `VARCHAR(255)`                     | Logo path or filename             |
| `email`      | `VARCHAR(255)`                     | Contact email, required           |
| `nb_users`   | `INT DEFAULT 2`                    | Defaults to 2                     |
| `status`     | `ENUM('pending', 'active', 'non-active')` | Company status             |

**Trigger**: `before_insert_company`
- Automatically generates a UUID for the `id`.

**Trigger**: `after_insert_company`
- Automatically creates a default admin user associated with this company.

---

### 2. `users`

| Field          | Type                                     | Description                          |
|----------------|------------------------------------------|--------------------------------------|
| `id`           | `VARCHAR(255)` (UUID)                    | Primary key, generated via trigger   |
| `firstname`    | `VARCHAR(100)`                           | First name                           |
| `lastname`     | `VARCHAR(100)`                           | Last name                            |
| `email`        | `VARCHAR(255)` UNIQUE                    | User email, required                 |
| `email_second` | `VARCHAR(255)`                           | Optional secondary email             |
| `identifier`   | `VARCHAR(100)`                           | Internal reference ID (nullable)     |
| `phone1`       | `VARCHAR(25)`                            | Primary phone (nullable)             |
| `phone2`       | `VARCHAR(25)`                            | Secondary phone (nullable)           |
| `password`     | `VARCHAR(255)`                           | Hashed password or temp password     |
| `status`       | `ENUM('pending', 'active', 'not active')`| Optional user status                 |
| `role`         | `ENUM('superAdmin', 'admin', 'user')`    | Optional role                        |
| `company_id`   | `VARCHAR(255)`                           | Foreign key linked to `company(id)`  |

**Trigger**: `before_insert_user`
- Generates a UUID if `id`.

---

## 🔁 Trigger Logic Explained

### 1. `before_insert_company`

```sql
IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
END IF;
```

Ensures each company gets a unique UUID.

### 2. `after_insert_company`

```sql
INSERT INTO users (
    id, firstname, lastname, email, password, company_id
) VALUES (
    UUID(), 'admin', 'admin', NEW.email, SUBSTRING(UUID(), 1, 8), NEW.id
);
```

- Creates a default admin user (admin/admin) for every new company.
- Uses company's email and links via `company_id`.
- Password is a temporary string derived from UUID.



---

## 🚀 Notes for Backend Developers

- Add functionality to reset password for first login.
- Cursor AI or any backend should avoid sending `id` during creation unless needed.
- Follow-up logic: sending emails, managing roles, and activating accounts will be handled on the app level.

---

## ✅ Ready for Development

The `manageSol` database structure and triggers are complete and tested for MVP integration.