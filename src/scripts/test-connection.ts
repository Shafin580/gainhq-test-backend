import { sequelize, testConnection } from "../config/database";

async function test() {
  console.log("🔍 Testing database connection...");
  console.log(
    "Connection string:",
    process.env.POSTGRES_CONNECTION_STRING?.substring(0, 50) + "..."
  );

  try {
    await testConnection();
    console.log("✅ Connection test passed!");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    await sequelize.close();
    process.exit(1);
  }
}

test();
