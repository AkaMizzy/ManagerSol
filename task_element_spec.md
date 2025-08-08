
# Task Element Table Specification

## Overview
The `task_element` table is used to store the definitions of different types of tasks that can be created in the system.  
Each task element has an associated type, description, and optional validation mask using regex.  
This structure will allow the admin to define flexible task inputs for different use cases.

---

## Table Structure: `task_element`

| Column       | Type        | Constraints                                 | Description |
|--------------|------------|----------------------------------------------|-------------|
| id           | VARCHAR(255) | PRIMARY KEY, generated via UUID trigger      | Unique identifier for the task element |
| title        | VARCHAR(100) | NOT NULL                                    | Title of the task element |
| description  | TEXT        | NULLABLE                                    | Detailed explanation of the task element |
| type         | ENUM('text', 'number', 'file', 'date', 'boolean', 'gps', 'list') | NOT NULL | Specifies the data type of the task element |
| mask         | VARCHAR(255) | NULLABLE                                    | Regex pattern for validation |

---

## Trigger for UUID Generation

We use a MySQL `BEFORE INSERT` trigger to automatically generate a UUID for the `id` field if not provided.

```sql
DELIMITER //
CREATE TRIGGER before_insert_task_element
BEFORE INSERT ON task_element
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = UUID();
    END IF;
END;
//
DELIMITER ;
```

This ensures all inserted rows have a globally unique identifier.

---

## Why This Design?

- **UUID as ID**: Ensures uniqueness across distributed systems and avoids collision issues common with auto-increment IDs.
- **Type Flexibility**: ENUM field restricts allowed input types while providing flexibility for task definition.
- **Regex Mask**: Allows custom input validation for each task element.
- **Admin CRUD**: Admin users will be able to Create, Read, Update, and Delete task elements via the backend interface.

---

## CRUD Requirements for Backend

- **Create**: Admin can define a new task element by providing `intitule`, `type`, `description` and optional `mask`.
- **Read**: List all task elements with filters by type.
- **Update**: Admin can modify title, description, type, or regex pattern.
- **Delete**: Admin can remove unused task elements.

---

## Example Row

| id                                   | intitule       | description                  | type     | mask       |
|--------------------------------------|--------------- |------------------------------|----------|------------|
| `550e8400-e29b-41d4-a716-446655440000` | "Start Date" | "Date when task starts"      | date     | NULL       |
| `660e8400-e29b-41d4-a716-446655441111` | "Email"      | "User email address"         | text     | NULL       |

---
