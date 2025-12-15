export const typeDefs = `#graphql
  # Authentication Types
  type User {
    id: ID!
    email: String!
    role: String!
    student: Student
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignUpInput {
    email: String!
    password: String!
    name: String!
    instituteId: ID!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  # Institute Types
  type Institute {
    id: ID!
    name: String!
    location: String!
    students: [Student!]
    createdAt: String!
    updatedAt: String!
  }

  input CreateInstituteInput {
    name: String!
    location: String!
  }

  input UpdateInstituteInput {
    name: String
    location: String
  }

  type PaginatedInstitutes {
    items: [Institute!]!
    totalCount: Int!
    hasMore: Boolean!
    limit: Int!
    offset: Int!
  }

  # Student Types
  type Student {
    id: ID!
    name: String!
    email: String!
    institute: Institute!
    user: User!
    results: [Result!]
    createdAt: String!
    updatedAt: String!
  }

  input CreateStudentInput {
    name: String!
    email: String!
    instituteId: ID!
    userId: ID!
  }

  input UpdateStudentInput {
    name: String
    email: String
    instituteId: ID
  }

  type PaginatedStudents {
    items: [Student!]!
    totalCount: Int!
    hasMore: Boolean!
    limit: Int!
    offset: Int!
  }

  # Course Types
  type Course {
    id: ID!
    title: String!
    code: String!
    credits: Int!
    results: [Result!]
    createdAt: String!
    updatedAt: String!
  }

  input CreateCourseInput {
    title: String!
    code: String!
    credits: Int!
  }

  input UpdateCourseInput {
    title: String
    code: String
    credits: Int
  }

  type PaginatedCourses {
    items: [Course!]!
    totalCount: Int!
    hasMore: Boolean!
    limit: Int!
    offset: Int!
  }

  # Result Types
  type Result {
    id: ID!
    student: Student!
    course: Course!
    score: Float!
    grade: String!
    year: Int!
    createdAt: String!
    updatedAt: String!
  }

  input CreateResultInput {
    studentId: ID!
    courseId: ID!
    score: Float!
    grade: String!
    year: Int!
  }

  input UpdateResultInput {
    score: Float
    grade: String
    year: Int
  }

  type PaginatedResults {
    items: [Result!]!
    totalCount: Int!
    hasMore: Boolean!
    limit: Int!
    offset: Int!
  }

  # Analytics Types
  type InstituteResults {
    institute: Institute!
    results: [Result!]!
    averageScore: Float!
    totalStudents: Int!
  }

  type TopCourse {
    course: Course!
    enrollmentCount: Int!
    year: Int!
  }

  type TopStudent {
    student: Student!
    totalScore: Float!
    averageScore: Float!
    resultCount: Int!
  }

  # Root Query
  type Query {
    # Authentication
    me: User

    # Institutes
    institute(id: ID!): Institute
    institutes(limit: Int, offset: Int, search: String): PaginatedInstitutes!

    # Students
    student(id: ID!): Student
    students(limit: Int, offset: Int, search: String): PaginatedStudents!

    # Courses
    course(id: ID!): Course
    courses(limit: Int, offset: Int, search: String): PaginatedCourses!

    # Results
    result(id: ID!): Result
    results(limit: Int, offset: Int, search: String, year: Int): PaginatedResults!

    # Analytics/Complex Queries
    allData: [Institute!]!
    resultsPerInstitute(instituteId: ID): [InstituteResults!]!
    topCourses(year: Int!, limit: Int): [TopCourse!]!
    topStudents(limit: Int): [TopStudent!]!
  }

  # Root Mutation
  type Mutation {
    # Authentication
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!

    # Institutes
    createInstitute(input: CreateInstituteInput!): Institute!
    updateInstitute(id: ID!, input: UpdateInstituteInput!): Institute!
    deleteInstitute(id: ID!): Boolean!

    # Students
    createStudent(input: CreateStudentInput!): Student!
    updateStudent(id: ID!, input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): Boolean!

    # Courses
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Boolean!

    # Results
    createResult(input: CreateResultInput!): Result!
    updateResult(id: ID!, input: UpdateResultInput!): Result!
    deleteResult(id: ID!): Boolean!
  }
`;
