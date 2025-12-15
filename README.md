# GainHQ Backend - Production-Ready API

A high-performance backend application built with Node.js, Express.js, TypeScript, GraphQL (Apollo Server), Sequelize ORM, and PostgreSQL. Features JWT authentication, comprehensive CRUD operations, complex analytics queries, and database optimization with indexing and multithreaded seeding.

## 🚀 Features

- **GraphQL API** with Apollo Server
- **TypeScript** for type safety
- **JWT Authentication** with bcrypt password hashing
- **Sequelize ORM** with PostgreSQL
- **CRUD Operations** for Institutes, Students, Courses, and Results
- **Complex Analytics Queries**: 
  - All data with relationships
  - Results per institute
  - Top courses by year
  - Top students by cumulative score
- **Database Indexing** for optimized performance (10-100x faster queries)
- **Multithreaded Seeder** to generate 100k+ records using Worker Threads
- **Pagination** support for list queries
- **Postman Collection** for API testing

---

## 📊 Database Schema

```
Users (1) ─── (1) Students
                   │
Institutes (1) ─── (*) Students
                        │
                        │ (*)
                        ↓
                     Results ← (*) ─── (1) Courses
```

### Tables
- `users`: id, email, password, role
- `institutes`: id, name, location
- `students`: id, name, email, instituteId (FK), userId (FK)
- `courses`: id, title, code, credits
- `results`: id, studentId (FK), courseId (FK), score, grade, year

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5
- **Framework**: Express.js 4
- **GraphQL**: Apollo Server 4
- **ORM**: Sequelize 6
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Data Generation**: @faker-js/faker
- **Package Manager**: pnpm

---

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm run build
```

---

## ⚙️ Configuration

Create or update `.env` file:

```env
POSTGRES_CONNECTION_STRING='your-postgresql-connection-string'
JWT_SECRET='your-super-secret-jwt-key'
JWT_EXPIRES_IN='24h'
PORT=4000
NODE_ENV='development'
```

---

## 🏃 Running the Application

### 1. Run Migrations
```bash
pnpm run migrate
```

### 2. Seed Database (Optional - 100k+ records)
```bash
pnpm run seed
```
*Note: Seeding takes several minutes using 2-3 worker threads optimized for Neon free plan.*

### 3. Add Database Indexes (Recommended)
```bash
pnpm run add-indexes
```

### 4. Start Development Server
```bash
pnpm run dev
```

The server will start at `http://localhost:4000`

- GraphQL Playground: `http://localhost:4000/graphql`
- Health Check: `http://localhost:4000/health`

---

## 📖 API Usage

### Authentication

#### Sign Up
```graphql
mutation SignUp {
  signUp(input: {
    email: "student@example.com"
    password: "password123"
    name: "John Doe"
    instituteId: "<institute-id>"
  }) {
    token
    user {
      id
      email
      role
    }
  }
}
```

#### Sign In
```graphql
mutation SignIn {
  signIn(input: {
    email: "student0@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      email
    }
  }
}
```

**Include JWT token in headers for authenticated requests**:
```
Authorization: Bearer <your-jwt-token>
```

### CRUD Operations

#### List Institutes (Paginated)
```graphql
query Institutes {
  institutes(limit: 10, offset: 0) {
    items {
      id
      name
      location
    }
    totalCount
    hasMore
  }
}
```

#### Create Course
```graphql
mutation CreateCourse {
  createCourse(input: {
    title: "Introduction to Computer Science"
    code: "CS101"
    credits: 3
  }) {
    id
    title
    code
  }
}
```

### Analytics Queries

#### Top Students Globally
```graphql
query TopStudents {
  topStudents(limit: 10) {
    student {
      name
      email
      institute {
        name
      }
    }
    totalScore
    averageScore
    resultCount
  }
}
```

#### Top Courses by Year
```graphql
query TopCourses {
  topCourses(year: 2024, limit: 10) {
    course {
      title
      code
    }
    enrollmentCount
  }
}
```

#### Results Per Institute
```graphql
query ResultsPerInstitute {
  resultsPerInstitute {
    institute {
      name
      location
    }
    averageScore
    totalStudents
  }
}
```

---

## 📁 Project Structure

```
src/
├── config/
│   ├── database.ts          # Sequelize configuration
│   └── auth.ts              # JWT configuration
├── models/
│   ├── index.ts             # Model associations
│   ├── User.ts
│   ├── Institute.ts
│   ├── Student.ts
│   ├── Course.ts
│   └── Result.ts
├── graphql/
│   ├── schema/
│   │   └── index.ts         # GraphQL type definitions
│   └── resolvers/
│       ├── index.ts         # Combined resolvers
│       ├── auth.ts          # Authentication resolvers
│       ├── institute.ts     # Institute CRUD
│       ├── student.ts       # Student CRUD
│       ├── course.ts        # Course CRUD
│       ├── result.ts        # Result CRUD
│       └── analytics.ts     # Complex queries
├── middleware/
│   └── auth.ts              # JWT verification
├── scripts/
│   ├── migrate.ts           # Database migrations
│   ├── seeder.ts            # Main seeder (coordinator)
│   ├── seeder-worker.ts     # Worker thread for seeding
│   └── add-indexes.ts       # Add database indexes
├── utils/
│   └── pagination.ts        # Pagination helpers
└── index.ts                 # Application entry point
```

---

## 🧪 Testing

### Using Postman Collection

This project includes a complete Postman collection with **28 pre-configured endpoints** for all API operations.

#### Import Collection and Environment

1. **Import the Collection**:
   - Open Postman
   - Click **Import** button
   - Drag and drop or select file: `postman/collection.json`
   - Click **Import**

2. **Import the Environment**:
   - Click **Import** again  
   - Select file: `postman/environment.json`
   - Click **Import**

3. **Select the Environment**:
   - In the top-right corner, click the environment dropdown
   - Select **"GainHQ Backend - Local"**

#### Quick Start Guide

**Step 1: Sign In**
1. Open the **Authentication** folder
2. Click **Sign In** request
3. The request is pre-filled with: `student0@example.com` / `password123`
4. Click **Send**
5. Copy the `token` from the response

**Step 2: Set Token**
1. Click the **GainHQ Backend - Local** environment (top-right)
2. Click the **👁️ eye icon** next to it
3. Find the `token` variable
4. Paste your token in the **CURRENT VALUE** field
5. Click **Save**

**Step 3: Test Any Endpoint**
- All other requests now have the token automatically included!
- Try: **Institutes → List Institutes**
- Try: **Analytics → Top Students Globally**

#### Available Endpoints (28 Total)

**🔐 Authentication** (3 endpoints)
- Sign Up
- Sign In  
- Get Current User (Me)

**🏛️ Institutes** (5 endpoints)
- List Institutes (paginated)
- Get Institute by ID
- Create Institute
- Update Institute
- Delete Institute

**👨‍🎓 Students** (4 endpoints)
- List Students (paginated)
- Get Student by ID
- Update Student
- Delete Student

**📚 Courses** (5 endpoints)
- List Courses (paginated)
- Get Course by ID
- Create Course
- Update Course
- Delete Course

**📊 Results** (5 endpoints)
- List Results (paginated)
- Get Result by ID
- Create Result
- Update Result
- Delete Result

**📈 Analytics** (4 endpoints)
- All Data with Relationships
- Results Per Institute
- Top Courses by Year
- Top Students Globally

#### Example Credentials

Use any of these pre-seeded accounts:
- Email: `student0@example.com` to `student99999@example.com`
- Password: `password123` (all accounts)

### Using GraphQL Playground

1. Start the server: `pnpm run dev`
2. Open: `http://localhost:4000/graphql`
3. Write queries/mutations in the left panel
4. Add Authorization header for protected endpoints:
   ```json
   {
     "Authorization": "Bearer your-jwt-token-here"
   }
   ```
5. Click the **▶️ Play** button to execute

---

## 📈 Performance

### Database Optimization
- **Indexes** on foreign keys and frequently queried columns
- **Connection pooling** (max: 3 for Neon free plan)
- **Eager loading** with Sequelize includes

### Seeding Performance
- **Multithreaded** using Worker Threads
- **Batch inserts** (1000 records per batch)
- **CPU-aware** (detects cores, limits to 3 for Neon)
- **100k+ records** in ~5-10 minutes

### Query Performance (with indexes)
- Complex aggregations: **35ms** (vs 342ms without indexes)
- Top students query: **10x faster**
- Authentication lookup: **100x faster**

See `docs/performance-analysis.md` for detailed benchmarks.

---

## 📚 Documentation

- **[JWT Best Practices](docs/jwt-best-practices.md)**: Authentication, security, token management
- **[Performance Analysis](docs/performance-analysis.md)**: Before/after indexing comparison
- **[Postman Collection](postman/collection.json)**: API endpoint examples

---

## 🔧 Scripts

```bash
pnpm run dev            # Start development server with hot reload
pnpm run build          # Compile TypeScript to dist/
pnpm run start          # Run compiled JavaScript
pnpm run migrate        # Create/sync database tables
pnpm run migrate:undo   # Drop all tables
pnpm run seed           # Seed database with 100k+ records
pnpm run add-indexes    # Add database indexes
```

---

## 🌟 Best Practices Implemented

### Security
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Environment variable configuration
- ✅ SQL injection protection (Sequelize parameterized queries)
- ✅ GraphQL error handling

### Code Quality
- ✅ TypeScript strict mode
- ✅ Type-safe models and resolvers
- ✅ Modular architecture (separation of concerns)
- ✅ Consistent error handling
- ✅ Clean code structure

### Performance
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Pagination for large datasets
- ✅ Efficient aggregations
- ✅ Multithreaded seeding

### Developer Experience
- ✅ Clear documentation
- ✅ Postman collection for testing
- ✅ Comprehensive error messages
- ✅ Health check endpoint
- ✅ Easy environment configuration

---

## 🛡️ Production Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a cryptographically secure random string
- [ ] Set `NODE_ENV='production'`
- [ ] Enable HTTPS/SSL
- [ ] Reduce `JWT_EXPIRES_IN` to 15-60 minutes
- [ ] Implement refresh token mechanism (see `docs/jwt-best-practices.md`)
- [ ] Add rate limiting on authentication endpoints
- [ ] Set up logging and monitoring
- [ ] Configure database backups
- [ ] Review and adjust connection pool size based on hosting plan
- [ ] Run `pnpm run add-indexes` on production database
- [ ] Set up CI/CD pipeline

---

## 📄 License

ISC

---

## 👨‍💻 Author

Created as a production-ready backend demonstration project.

---

## 🙏 Acknowledgments

- Apollo GraphQL
- Sequelize
- PostgreSQL
- The open-source community