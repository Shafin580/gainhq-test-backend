# Database Schema and SQL Scripts

This document provides complete SQL scripts for creating the database schema and indexes for the GainHQ student management system.

## Overview

The database uses **PostgreSQL** with **SSL connection** (required for Neon). The schema consists of 5 main tables:
- `users` - Authentication and user management
- `institutes` - Educational institutions
- `students` - Student profiles
- `courses` - Course catalog
- `results` - Student academic results

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o| students : "has one"
    institutes ||--o{ students : "has many"
    students ||--o{ results : "has many"
    courses ||--o{ results : "has many"
    
    users {
        uuid id PK
        string email UK
        string password
        enum role
        timestamp createdAt
        timestamp updatedAt
    }
    
    institutes {
        uuid id PK
        string name
        string location
        timestamp createdAt
        timestamp updatedAt
    }
    
    students {
        uuid id PK
        string name
        string email
        uuid instituteId FK
        uuid userId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    courses {
        uuid id PK
        string title
        string code UK
        integer credits
        timestamp createdAt
        timestamp updatedAt
    }
    
    results {
        uuid id PK
        uuid studentId FK
        uuid courseId FK
        decimal score
        string grade
        integer year
        timestamp createdAt
        timestamp updatedAt
    }
```

## Complete Schema Creation SQL

### Step 1: Create Tables

```sql
-- =============================================
-- Table: users
-- Description: Stores user authentication data
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT users_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- =============================================
-- Table: institutes
-- Description: Educational institutions
-- =============================================
CREATE TABLE IF NOT EXISTS institutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- Table: students
-- Description: Student profiles with institute and user relationships
-- =============================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    "instituteId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT students_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT fk_students_institute FOREIGN KEY ("instituteId") 
        REFERENCES institutes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_students_user FOREIGN KEY ("userId") 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- Table: courses
-- Description: Course catalog with unique codes
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    credits INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT courses_credits_range CHECK (credits >= 1 AND credits <= 6)
);

-- =============================================
-- Table: results
-- Description: Student academic results with grades and scores
-- =============================================
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    score DECIMAL(5, 2) NOT NULL,
    grade VARCHAR(2) NOT NULL,
    year INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT results_score_range CHECK (score >= 0 AND score <= 100),
    CONSTRAINT results_grade_valid CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F')),
    CONSTRAINT results_year_range CHECK (year >= 2000 AND year <= 2100),
    CONSTRAINT fk_results_student FOREIGN KEY ("studentId") 
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_results_course FOREIGN KEY ("courseId") 
        REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

### Step 2: Create Indexes for Performance

```sql
-- =============================================
-- INDEXES FOR USERS TABLE
-- =============================================

-- Email lookup (for authentication)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- INDEXES FOR STUDENTS TABLE
-- =============================================

-- Foreign key lookups
CREATE INDEX IF NOT EXISTS idx_students_institute_id ON students("instituteId");
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students("userId");

-- Email search
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- =============================================
-- INDEXES FOR RESULTS TABLE
-- =============================================

-- Foreign key lookups
CREATE INDEX IF NOT EXISTS idx_results_student_id ON results("studentId");
CREATE INDEX IF NOT EXISTS idx_results_course_id ON results("courseId");

-- Filtering and sorting by year
CREATE INDEX IF NOT EXISTS idx_results_year ON results(year);

-- Filtering and sorting by score
CREATE INDEX IF NOT EXISTS idx_results_score ON results(score);

-- Composite index for year + score queries (analytics)
CREATE INDEX IF NOT EXISTS idx_results_year_score ON results(year, score DESC);
```

## Index Strategy Explanation

### Performance-Critical Indexes

1. **`idx_users_email`** - Accelerates user authentication lookups by email
2. **`idx_students_institute_id`** - Optimizes queries filtering students by institute
3. **`idx_students_user_id`** - Speeds up user-to-student profile lookups
4. **`idx_students_email`** - Enables fast student search by email
5. **`idx_results_student_id`** - Essential for fetching all results for a student
6. **`idx_results_course_id`** - Optimizes course enrollment and result queries
7. **`idx_results_year`** - Enables efficient year-based filtering
8. **`idx_results_score`** - Supports score-based sorting and filtering
9. **`idx_results_year_score`** - Composite index for analytics queries that filter by year and sort by score

### Why These Indexes?

- **Foreign Keys**: All foreign key columns are indexed to speed up JOIN operations
- **Search Fields**: Email fields are indexed for search functionality
- **Analytics**: Year and score indexes support common analytical queries
- **Composite Index**: The `year_score` index specifically optimizes the `topCourses` and `topStudents` queries

## Database Statistics

After running migrations and seeding, the database contains:
- **5 tables** (users, institutes, students, courses, results)
- **9 indexes** (listed above)
- **Cascading deletes** on all foreign key relationships

## Running the Scripts

### Using the Migration Script

```bash
# Run migrations to create all tables
npm run migrate

# Drop all tables (use with caution)
npm run migrate -- --undo
```

### Using the Index Script

```bash
# Create all indexes
npm run add-indexes
```

### Direct SQL Execution

You can also execute the SQL scripts directly using `psql`:

```bash
# Connect to database
psql "$POSTGRES_CONNECTION_STRING"

# Run schema creation
\i path/to/schema.sql

# Run index creation
\i path/to/indexes.sql
```

## Constraints Summary

| Table | Constraint Type | Description |
|-------|----------------|-------------|
| users | CHECK | `role` must be 'admin' or 'student' |
| users | CHECK | `email` must be valid email format |
| users | UNIQUE | `email` must be unique |
| students | FOREIGN KEY | `instituteId` references institutes(id) |
| students | FOREIGN KEY | `userId` references users(id) |
| students | CHECK | `email` must be valid email format |
| courses | UNIQUE | `code` must be unique |
| courses | CHECK | `credits` must be between 1 and 6 |
| results | FOREIGN KEY | `studentId` references students(id) |
| results | FOREIGN KEY | `courseId` references courses(id) |
| results | CHECK | `score` must be between 0 and 100 |
| results | CHECK | `grade` must be valid letter grade |
| results | CHECK | `year` must be between 2000 and 2100 |

## Connection Configuration

The application uses Sequelize ORM with the following configuration:

```typescript
// Connection string format
POSTGRES_CONNECTION_STRING=postgresql://user:password@host:port/database

// Pool settings
max: 16        // Maximum connections
min: 0         // Minimum connections
acquire: 60s   // Maximum time to acquire connection
idle: 10s      // Maximum idle time

// SSL settings
ssl: {
  require: true,
  rejectUnauthorized: false
}
```

## Backup Recommendations

> [!IMPORTANT]
> Always backup your database before running migrations in production.

```bash
# Export database
pg_dump "$POSTGRES_CONNECTION_STRING" > backup.sql

# Restore database
psql "$POSTGRES_CONNECTION_STRING" < backup.sql
```

## Additional Notes

- All tables use UUID primary keys with automatic generation
- Timestamps (`createdAt`, `updatedAt`) are automatically managed by Sequelize
- All foreign key constraints use `CASCADE` for both `DELETE` and `UPDATE` operations
- The database enforces data integrity through constraints at the database level
- Indexes are created with `IF NOT EXISTS` to allow safe re-execution
