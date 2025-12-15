import { sequelize } from "../config/database";

async function addIndexes() {
  try {
    console.log("🔍 Starting index creation...");

    // Indexes for students table
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_students_institute_id ON students("instituteId");'
    );
    console.log("✓ Created index on students.instituteId");

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_students_user_id ON students("userId");'
    );
    console.log("✓ Created index on students.userId");

    await sequelize.query(
      "CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);"
    );
    console.log("✓ Created index on students.email");

    // Indexes for results table
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_results_student_id ON results("studentId");'
    );
    console.log("✓ Created index on results.studentId");

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_results_course_id ON results("courseId");'
    );
    console.log("✓ Created index on results.courseId");

    await sequelize.query(
      "CREATE INDEX IF NOT EXISTS idx_results_year ON results(year);"
    );
    console.log("✓ Created index on results.year");

    await sequelize.query(
      "CREATE INDEX IF NOT EXISTS idx_results_score ON results(score);"
    );
    console.log("✓ Created index on results.score");

    // Composite index for year + score queries
    await sequelize.query(
      "CREATE INDEX IF NOT EXISTS idx_results_year_score ON results(year, score DESC);"
    );
    console.log("✓ Created composite index on results(year, score)");

    // Index for users table
    await sequelize.query(
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"
    );
    console.log("✓ Created index on users.email");

    console.log("\n✅ All indexes created successfully!");
    console.log("📊 Total indexes: 9");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Index creation failed:", error);
    await sequelize.close();
    process.exit(1);
  }
}

addIndexes();
