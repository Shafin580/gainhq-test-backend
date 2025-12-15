import { sequelize } from "../config/database";
import { User, Institute, Student, Course, Result } from "../models";

async function runMigrations() {
  try {
    console.log("🚀 Starting database migrations...");

    // Check if --undo flag is present
    const isUndo = process.argv.includes("--undo");

    if (isUndo) {
      console.log("⏪ Dropping all tables...");
      await sequelize.drop();
      console.log("✅ All tables dropped successfully.");
    } else {
      // Sync all models with the database individually
      // Order matters due to foreign key constraints
      console.log("Creating tables...");

      await User.sync({ alter: true });
      console.log("  ✓ users");

      await Institute.sync({ alter: true });
      console.log("  ✓ institutes");

      await Student.sync({ alter: true });
      console.log("  ✓ students");

      await Course.sync({ alter: true });
      console.log("  ✓ courses");

      await Result.sync({ alter: true });
      console.log("  ✓ results");

      console.log("\n✅ All models synchronized successfully.");

      // Verify tables were created
      const [tables] = await sequelize.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

      console.log(
        `📊 Verified ${tables.length} tables in database:`,
        tables.map((t: any) => t.table_name).join(", ")
      );
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await sequelize.close();
    process.exit(1);
  }
}

runMigrations();
